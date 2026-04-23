import type { ValidationIssue } from '../model/issues'
import type { ValidationOptions } from '../model/options'
import type { ValidationResult } from '../model/result'
import { toErrorTree } from '../utils/to-error-tree'

import { type RefineOptions, type RuntimeSchema, ValidationError } from './base'
import {
  createParseContext,
  createRefinementContext,
  fail,
  ok,
  type ParseContext,
  type ParseResult,
  type RefinementContext,
} from './context'
import type { SchemaExtension } from './extension'

interface RefinementEffect<TOutput> {
  code: string
  message: string
  check: (value: TOutput, context: RefinementContext) => void | boolean
}

interface EffectsLayer<TOutput> {
  transform?: (value: unknown) => unknown
  refinement?: RefinementEffect<TOutput>
}

export class EffectsSchema<TInput = unknown, TOutput = unknown> implements RuntimeSchema<TInput, TOutput> {
  private readonly inner: RuntimeSchema<TInput, unknown>
  private readonly layer: EffectsLayer<TOutput>

  public constructor(inner: RuntimeSchema<TInput, unknown>, layer: EffectsLayer<TOutput> = {}) {
    this.inner = inner
    this.layer = layer
  }

  public parse(input: TInput, options?: ValidationOptions): TOutput {
    const result = this.safeParse(input, options)

    if (result.ok) return result.value

    throw new ValidationError(result.issues, result.errors)
  }

  public safeParse(input: TInput, options?: ValidationOptions): ValidationResult<TOutput> {
    const issues: ValidationIssue[] = []
    const context = createParseContext(issues, options)
    const result = this._run(input, context)

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

  public _run(input: unknown, context: ParseContext): ParseResult<TOutput> {
    const issueCountBefore = context.issues.length
    const parsed = this.inner._run(input, context)

    if (!parsed.ok) return fail()

    let value: unknown = parsed.value

    if (this.layer.transform) {
      try {
        value = this.layer.transform(value)
      } catch (error) {
        context.addIssue({
          code: 'transform.failed',
          message: error instanceof Error ? error.message : 'Transform failed',
          input: value,
        })

        return fail()
      }
    }

    if (this.layer.refinement) {
      const refinementContext = createRefinementContext(context)
      const refinement = this.layer.refinement

      try {
        const result = refinement.check(value as TOutput, refinementContext)

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

    if (context.issues.length > issueCountBefore) {
      return fail()
    }

    return ok(value as TOutput)
  }

  public transform<TNextOutput>(fn: (value: TOutput) => TNextOutput): EffectsSchema<TInput, TNextOutput> {
    return new EffectsSchema<TInput, TNextOutput>(this, {
      transform: value => fn(value as TOutput),
    })
  }

  public refine(
    check: (value: TOutput, context: RefinementContext) => void | boolean,
    options: RefineOptions
  ): EffectsSchema<TInput, TOutput> {
    return new EffectsSchema<TInput, TOutput>(this, {
      refinement: {
        code: options.code ?? 'schema.refine',
        message: options.message,
        check,
      },
    })
  }

  public use(extension: SchemaExtension<EffectsSchema<TInput, TOutput>>): EffectsSchema<TInput, TOutput> {
    return extension(this)
  }
}
