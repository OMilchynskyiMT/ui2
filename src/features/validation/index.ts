import type {
  ArraySchemaNode,
  NodeMessages,
  ObjectSchemaNode,
  RecordSchemaNode,
  RuntimeNode,
  SchemaNode,
  SchemaOptions,
  SchemaShape,
  ValidationContext,
  ValidationErrors,
  ValidationIssue,
  ValidationPath,
  ValidationResult,
  Validator,
  ValueSchemaNode,
} from './types'

export { email, inRange, matches, maxLength, minLength, oneOf } from './validators/string'

const emptyValues: ReadonlySet<unknown> = new Set([undefined, null, ''])

const defaultSchemaOptions: Required<SchemaOptions> = {
  requiredMessage: 'This field is required',
  typeMessage: typeName => `Expected ${typeName}`,
}

type LiteralValue = string | number | boolean

const valueNode = <T>(
  typeName: string,
  isValidType: (value: unknown) => boolean,
  validators: readonly Validator<T>[]
): ValueSchemaNode<T> => {
  return {
    kind: 'value',
    optional: false,
    typeName,
    validators,
    messages: {},
    isValidType,
  }
}

const string = (...validators: readonly Validator<string>[]): ValueSchemaNode<string> => {
  return valueNode('string', (value): value is string => typeof value === 'string', validators)
}

const number = (...validators: readonly Validator<number>[]): ValueSchemaNode<number> => {
  return valueNode(
    'number',
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
    validators
  )
}

const boolean = (...validators: readonly Validator<boolean>[]): ValueSchemaNode<boolean> => {
  return valueNode('boolean', (value): value is boolean => typeof value === 'boolean', validators)
}

const enumeration = <const TValues extends readonly [string, ...string[]]>(
  values: TValues,
  ...validators: readonly Validator<TValues[number]>[]
): ValueSchemaNode<TValues[number]> => {
  const allowed = new Set<string>(values)

  return valueNode(
    `one of: ${values.join(', ')}`,
    (value): value is TValues[number] => typeof value === 'string' && allowed.has(value),
    validators
  )
}

const literal = <const T extends LiteralValue>(
  expected: T,
  ...validators: readonly Validator<T>[]
): ValueSchemaNode<T> => {
  if (expected === '') {
    throw new TypeError('An empty string cannot be used as a literal because it represents a missing value')
  }

  return valueNode(`literal ${JSON.stringify(expected)}`, value => Object.is(value, expected), validators)
}

const object = <T extends object>(
  shape: SchemaShape<T>,
  ...validators: readonly Validator<T>[]
): ObjectSchemaNode<T> => {
  return {
    kind: 'object',
    optional: false,
    typeName: 'object',
    validators,
    messages: {},
    shape,
    isValidType: (value): boolean => typeof value === 'object' && value !== null && !Array.isArray(value),
  }
}

const array = <T>(item: SchemaNode<T, false>, ...validators: readonly Validator<T[]>[]): ArraySchemaNode<T> => {
  return {
    kind: 'array',
    optional: false,
    typeName: 'array',
    validators,
    messages: {},
    item,
    isValidType: Array.isArray,
  }
}

const record = <T>(
  entry: SchemaNode<T, false>,
  ...validators: readonly Validator<Record<string, T>>[]
): RecordSchemaNode<T> => {
  return {
    kind: 'record',
    optional: false,
    typeName: 'record',
    validators,
    messages: {},
    entry,
    isValidType: (input): boolean => typeof input === 'object' && input !== null && !Array.isArray(input),
  }
}

export const types = {
  string,
  number,
  boolean,
  enum: enumeration,
  literal,
  object,
  array,
  record,
} as const

export function optional<T>(node: SchemaNode<T, false>): SchemaNode<T, true> {
  return {
    ...node,
    optional: true,
  }
}

export function withMessages<T, TOptional extends boolean>(
  node: SchemaNode<T, TOptional>,
  messages: NodeMessages
): SchemaNode<T, TOptional> {
  return {
    ...node,
    messages: {
      ...node.messages,
      ...messages,
    },
  }
}

export function defineValidator<T>(validator: Validator<T>): Validator<T> {
  return validator
}

export class Schema<T extends object> {
  readonly #root: ObjectSchemaNode<T, false>
  readonly #options: Required<SchemaOptions>

  constructor(root: ObjectSchemaNode<T, false>, options: SchemaOptions = {}) {
    this.#root = root
    this.#options = {
      ...defaultSchemaOptions,
      ...options,
    }
  }

  #validateNode(
    node: RuntimeNode,
    value: unknown,
    path: ValidationPath,
    parent: unknown,
    root: unknown,
    issues: ValidationIssue[]
  ): void {
    if (this.#isEmpty(value)) {
      if (!node.optional) {
        issues.push({
          code: 'required',
          message: node.messages.required ?? this.#options.requiredMessage,
          path,
        })
      }

      return
    }

    if (!node.isValidType(value)) {
      issues.push({
        code: 'type',
        message: node.messages.type ?? this.#options.typeMessage(node.typeName),
        path,
      })

      return
    }

    const issueCount = issues.length

    switch (node.kind) {
      case 'object': {
        const recordValue = value as Record<string, unknown>
        for (const [key, childNode] of Object.entries(node.shape)) {
          this.#validateNode(childNode, recordValue[key], [...path, key], value, root, issues)
        }

        break
      }
      case 'array': {
        const values = value as readonly unknown[]
        for (const [index, itemValue] of values.entries()) {
          this.#validateNode(node.item, itemValue, [...path, index], value, root, issues)
        }

        break
      }
      case 'record': {
        const values = value as Record<string, unknown>
        for (const [key, entryValue] of Object.entries(values)) {
          this.#validateNode(node.entry, entryValue, [...path, key], value, root, issues)
        }

        break
      }
      // No default
    }

    if (issues.length > issueCount) return
    const context: ValidationContext = {
      root,
      parent,
      path,
    }

    for (const validator of node.validators) {
      if (validator.validate(value, context)) continue
      issues.push({
        code: validator.code,
        message: validator.message,
        path,
      })
    }
  }

  #createErrorTree(issues: readonly ValidationIssue[]): ValidationErrors<T> {
    const errors: Record<string | number, unknown> = {}

    for (const issue of issues) {
      const node = this.#getNode(issue.path)
      const isContainerLevel = node?.kind === 'object' || node?.kind === 'array' || node?.kind === 'record'
      this.#setError(errors, issue.path, issue.message, isContainerLevel)
    }

    return errors as ValidationErrors<T>
  }

  #setError(
    target: Record<string | number, unknown>,
    path: ValidationPath,
    message: string,
    isContainerLevel: boolean
  ): void {
    if (path.length === 0) {
      const current = (target.$errors ??= []) as string[]
      current.push(message)
      return
    }

    let cursor = target
    let node = this.#root as unknown as RuntimeNode

    for (let index = 0; index < path.length; index++) {
      const segment = path[index]!
      const isLeaf = index === path.length - 1

      if (node.kind === 'record') {
        cursor = (cursor.$entries ??= {}) as Record<string | number, unknown>
      }

      if (isLeaf && !isContainerLevel) {
        const current = (cursor[segment] ??= []) as string[]
        current.push(message)
        return
      }

      cursor = (cursor[segment] ??= {}) as Record<string | number, unknown>

      const childNode = this.#getChildNode(node, segment)
      if (!childNode) return

      node = childNode
    }

    const current = (cursor.$errors ??= []) as string[]
    current.push(message)
  }

  #getChildNode(node: RuntimeNode, segment: string | number): RuntimeNode | undefined {
    if (typeof segment === 'string' && node.kind === 'object') {
      return node.shape[segment]
    }

    if (typeof segment === 'number' && node.kind === 'array') {
      return node.item
    }

    if (typeof segment === 'string' && node.kind === 'record') {
      return node.entry
    }

    return undefined
  }

  #getNode(path: ValidationPath): RuntimeNode | undefined {
    let node = this.#root as unknown as RuntimeNode

    for (const segment of path) {
      const childNode = this.#getChildNode(node, segment)
      if (!childNode) return undefined
      node = childNode
    }

    return node
  }

  #isEmpty(value: unknown): boolean {
    return emptyValues.has(value)
  }

  validate(data: unknown): ValidationResult<T> {
    const issues: ValidationIssue[] = []
    this.#validateNode(this.#root as unknown as RuntimeNode, data, [], undefined, data, issues)

    return {
      valid: issues.length === 0,
      issues,
      errors: this.#createErrorTree(issues),
    }
  }
}
