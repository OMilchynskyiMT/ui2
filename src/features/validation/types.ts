export type ValidationPath = readonly (string | number)[]

export type ValidationIssue = Readonly<{
  code: string
  message: string
  path: ValidationPath
}>

export type ValidationContext = Readonly<{
  root: unknown
  parent: unknown
  path: ValidationPath
}>

export type Validator<T> = Readonly<{
  code: string
  message: string
  validate: (value: T, context: ValidationContext) => boolean
}>

export type ValidatorOptions = Readonly<{
  message?: string
}>

export type NodeMessages = Readonly<{
  required?: string
  type?: string
}>

type IsOptionalKey<T, K extends keyof T> = Pick<T, K> extends Required<Pick<T, K>> ? false : true

type ArrayValue<T> = T extends unknown[] ? T[number] : never

type RecordValue<T> = T extends Record<string, infer TValue> ? TValue : never

type BaseSchemaNode<T, TOptional extends boolean> = {
  readonly optional: TOptional
  readonly typeName: string
  readonly validators: readonly Validator<T>[]
  readonly messages: NodeMessages
  readonly isValidType: (value: unknown) => boolean
}

export type ValueSchemaNode<T, TOptional extends boolean = false> = BaseSchemaNode<T, TOptional> & {
  readonly kind: 'value'
}

export type ObjectSchemaNode<T extends object, TOptional extends boolean = false> = BaseSchemaNode<T, TOptional> & {
  readonly kind: 'object'
  readonly shape: SchemaShape<T>
}

export type ArraySchemaNode<T, TOptional extends boolean = false> = BaseSchemaNode<T[], TOptional> & {
  readonly kind: 'array'
  readonly item: SchemaNode<T, false>
}

export type RecordSchemaNode<T, TOptional extends boolean = false> = BaseSchemaNode<Record<string, T>, TOptional> & {
  readonly kind: 'record'
  readonly entry: SchemaNode<T, false>
}

export type SchemaNode<T, TOptional extends boolean> = [T] extends [unknown[]]
  ? ArraySchemaNode<ArrayValue<T>, TOptional>
  : [T] extends [object]
    ? string extends keyof T
      ? RecordSchemaNode<RecordValue<T>, TOptional>
      : ObjectSchemaNode<Extract<T, object>, TOptional>
    : ValueSchemaNode<T, TOptional>

export type SchemaShape<T extends object> = {
  [K in keyof T]-?: SchemaNode<NonNullable<T[K]>, IsOptionalKey<T, K>>
}

export type ValidationErrorNode<T> = [T] extends [unknown[]]
  ? ValidationArrayErrors<ArrayValue<T>>
  : [T] extends [object]
    ? string extends keyof T
      ? ValidationRecordErrors<RecordValue<T>>
      : ValidationObjectErrors<Extract<T, object>>
    : string[]

export type ValidationObjectErrors<T extends object> = {
  [K in keyof T]?: ValidationErrorNode<NonNullable<T[K]>>
} & {
  $errors?: string[]
}

export type ValidationArrayErrors<T> = {
  [index: number]: ValidationErrorNode<NonNullable<T>> | undefined
  $errors?: string[]
}

export type ValidationRecordErrors<T> = {
  $errors?: string[]
  $entries?: Partial<Record<string, ValidationErrorNode<NonNullable<T>>>>
}

export type ValidationErrors<T extends object> = ValidationObjectErrors<T>

export type ValidationResult<T extends object> = Readonly<{
  valid: boolean
  errors: ValidationErrors<T>
  issues: readonly ValidationIssue[]
}>

type RuntimeNodeBase = Readonly<{
  optional: boolean
  typeName: string
  validators: readonly Validator<unknown>[]
  messages: NodeMessages
  isValidType: (value: unknown) => boolean
}>

export type RuntimeNode =
  | (RuntimeNodeBase & Readonly<{ kind: 'value' }>)
  | (RuntimeNodeBase & Readonly<{ kind: 'object'; shape: Readonly<Record<string, RuntimeNode>> }>)
  | (RuntimeNodeBase & Readonly<{ kind: 'array'; item: RuntimeNode }>)
  | (RuntimeNodeBase & Readonly<{ kind: 'record'; entry: RuntimeNode }>)

export type SchemaOptions = Readonly<{
  requiredMessage?: string
  typeMessage?: (typeName: string) => string
}>
