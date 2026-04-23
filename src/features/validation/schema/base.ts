import type { ValidationErrorBranch } from '../model/errors'
import type { ValidationIssue } from '../model/issues'
import type { ValidationOptions } from '../model/options'
import type { ValidationResult } from '../model/result'
import { toErrorTree } from '../utils/to-error-tree'

import {
  createParseContext,
  createRefinementContext,
  fail,
  ok,
  type ParseContext,
  type ParseResult,
  type RefinementContext,
} from './context'

export interface Schema<Input = unknown, Output = Input> {
  parse(input: Input, options?: ValidationOptions): Output
  safeParse(input: Input, options?: ValidationOptions): ValidationResult<Output>
}

export interface RefineOptions {
  code?: string
  message: string
}

export interface RefinementRule<T> {
  code: string
  message: string
  check: (value: T, context: RefinementContext) => void | boolean
}

export type PreprocessFn = (input: unknown) => unknown
export type DefaultValueFactory<T> = () => T

export interface SchemaDefinition<TOutput = unknown> {
  isOptional: boolean
  isNullable: boolean
  defaultValue?: DefaultValueFactory<TOutput>
  requiredMessage: string
  nonnullableMessage: string
  preprocessors: readonly PreprocessFn[]
  refinements: readonly RefinementRule<unknown>[]
}

export function createSchemaDefinition<TOutput>(): SchemaDefinition<TOutput> {
  return {
    isOptional: false,
    isNullable: false,
    defaultValue: undefined,
    requiredMessage: 'Required',
    nonnullableMessage: 'Must not be null',
    preprocessors: [],
    refinements: [],
  }
}

export function cloneSchemaDefinition<TOutput>(
  definition: Readonly<SchemaDefinition<TOutput>>,
  patch: Partial<SchemaDefinition<TOutput>> = {}
): SchemaDefinition<TOutput> {
  return {
    ...definition,
    ...patch,
    preprocessors: [...(patch.preprocessors ?? definition.preprocessors)],
    refinements: [...(patch.refinements ?? definition.refinements)],
  }
}

function freezeSchemaDefinition<TOutput>(definition: SchemaDefinition<TOutput>): Readonly<SchemaDefinition<TOutput>> {
  return Object.freeze({
    ...definition,
    preprocessors: Object.freeze([...definition.preprocessors]),
    refinements: Object.freeze([...definition.refinements]),
  })
}

export class ValidationError extends Error {
  public readonly issues: ValidationIssue[]
  public readonly errors: ValidationErrorBranch

  public constructor(issues: ValidationIssue[], errors: ValidationErrorBranch) {
    super('Validation failed')
    this.name = 'ValidationError'
    this.issues = issues
    this.errors = errors
  }
}

export interface RuntimeSchema<Input = unknown, Output = Input> extends Schema<Input, Output> {
  _run(input: unknown, context: ParseContext): ParseResult<Output>
}

export type InferSchemaInput<TSchema extends Schema<unknown, unknown>> =
  TSchema extends Schema<infer TInput, unknown> ? TInput : never

export type InferSchemaOutput<TSchema extends Schema<unknown, unknown>> =
  TSchema extends Schema<unknown, infer TOutput> ? TOutput : never

export abstract class BaseSchema<Input = unknown, Output = Input> implements RuntimeSchema<Input, Output> {
  protected readonly definition: Readonly<SchemaDefinition<Output>>

  public _run(input: unknown, context: ParseContext): ParseResult<Output> {
    return this.execute(input, context)
  }

  protected constructor(definition?: SchemaDefinition<Output>) {
    this.definition = freezeSchemaDefinition(definition ?? createSchemaDefinition<Output>())
  }

  public parse(input: Input, options?: ValidationOptions): Output {
    const result = this.safeParse(input, options)

    if (result.ok) return result.value

    throw new ValidationError(result.issues, result.errors)
  }

  public safeParse(input: Input, options?: ValidationOptions): ValidationResult<Output> {
    const issues: ValidationIssue[] = []
    const context = createParseContext(issues, options)
    const result = this.execute(input, context)

    if (!result.ok || issues.length > 0) {
      return {
        ok: false,
        issues,
        errors: toErrorTree(issues),
      }
    }

    return {
      ok: true,
      value: result.value,
      issues: [],
      errors: {},
    }
  }

  protected abstract _parse(input: unknown, context: ParseContext): ParseResult<unknown>

  protected execute(input: unknown, context: ParseContext): ParseResult<Output> {
    const issueCountBefore = context.issues.length
    const prepared = this.applyPreprocessors(input)

    if (prepared === undefined) {
      if (this.definition.defaultValue) {
        return this.finalizeValue(this.definition.defaultValue(), context, issueCountBefore)
      }

      if (this.definition.isOptional) {
        return ok(undefined as Output)
      }

      context.addIssue({
        code: 'required',
        message: this.definition.requiredMessage,
        input: prepared,
      })

      return fail()
    }

    if (prepared === null) {
      if (this.definition.isNullable) {
        return ok(null as Output)
      }

      context.addIssue({
        code: 'null.disallowed',
        message: this.definition.nonnullableMessage,
        input: prepared,
      })

      return fail()
    }

    const parsed = this._parse(prepared, context)

    if (!parsed.ok) return fail()

    return this.finalizeValue(parsed.value, context, issueCountBefore)
  }

  protected finalizeValue(value: unknown, context: ParseContext, issueCountBefore: number): ParseResult<Output> {
    this.applyRefinements(value, context)

    if (context.issues.length > issueCountBefore) {
      return fail()
    }

    return ok(value as Output)
  }

  protected applyPreprocessors(input: unknown): unknown {
    let next = input

    for (const preprocess of this.definition.preprocessors) {
      next = preprocess(next)
    }

    return next
  }

  protected applyRefinements(value: unknown, context: ParseContext): void {
    const refinementContext = createRefinementContext(context)

    for (const refinement of this.definition.refinements) {
      try {
        const result = refinement.check(value, refinementContext)

        if (result === false) {
          context.addIssue({
            code: refinement.code,
            message: refinement.message,
            input: value,
          })
        }
      } catch (error) {
        context.addIssue({
          code: refinement.code,
          message: error instanceof Error ? error.message : refinement.message,
          input: value,
        })
      }
    }
  }
}
