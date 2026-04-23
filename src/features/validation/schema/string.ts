import { coerceToString, emptyStringAsUndefined } from '../utils/coerce'

import { type DefaultValueFactory, type PreprocessFn, type RefineOptions, type SchemaDefinition } from './base'
import { fail, ok, type ParseContext, type ParseResult, type RefinementContext } from './context'
import { FluentSchema } from './fluent'

export class StringSchema<TOutput = string> extends FluentSchema<unknown, TOutput> {
  public constructor(definition?: SchemaDefinition<TOutput>) {
    super(definition)
  }

  public optional(): StringSchema<TOutput | undefined> {
    return new StringSchema(this.optionalDefinition<TOutput | undefined>())
  }

  public required(message = this.definition.requiredMessage): StringSchema<Exclude<TOutput, undefined>> {
    return new StringSchema(this.requiredDefinition<Exclude<TOutput, undefined>>(message))
  }

  public nullable(): StringSchema<TOutput | null> {
    return new StringSchema(this.nullableDefinition<TOutput | null>())
  }

  public nonnullable(message = this.definition.nonnullableMessage): StringSchema<Exclude<TOutput, null>> {
    return new StringSchema(this.nonnullableDefinition<Exclude<TOutput, null>>(message))
  }

  public default(factory: DefaultValueFactory<Exclude<TOutput, undefined>>): StringSchema<Exclude<TOutput, undefined>> {
    return new StringSchema(this.defaultDefinition(factory))
  }

  public preprocess(fn: PreprocessFn): StringSchema<TOutput> {
    return new StringSchema(this.preprocessDefinition(fn))
  }

  public coerce(): StringSchema<TOutput> {
    return this.preprocess(coerceToString)
  }

  public emptyAsUndefined(): StringSchema<TOutput> {
    return this.preprocess(emptyStringAsUndefined)
  }

  public refine(
    check: (value: string, context: RefinementContext) => void | boolean,
    options: RefineOptions
  ): StringSchema<TOutput> {
    return new StringSchema(this.refinementDefinition<string>(check, options, 'string.refine'))
  }

  public min(length: number, message = `Must be at least ${length} characters`): StringSchema<TOutput> {
    return this.refine(value => value.length >= length, {
      code: 'string.min',
      message,
    })
  }

  public max(length: number, message = `Must be at most ${length} characters`): StringSchema<TOutput> {
    return this.refine(value => value.length <= length, {
      code: 'string.max',
      message,
    })
  }

  public pattern(pattern: RegExp, message = 'Invalid format'): StringSchema<TOutput> {
    return this.refine(
      value => {
        const nextPattern = new RegExp(pattern.source, pattern.flags)
        return nextPattern.test(value)
      },
      {
        code: 'string.pattern',
        message,
      }
    )
  }

  public trim(): StringSchema<TOutput> {
    return this.preprocess(input => (typeof input === 'string' ? input.trim() : input))
  }

  protected _parse(input: unknown, context: ParseContext): ParseResult<unknown> {
    if (typeof input !== 'string') {
      context.addIssue({
        code: 'string.type',
        message: 'Must be a string',
        input,
      })

      return fail()
    }

    return ok(input)
  }
}

export function string(): StringSchema<string> {
  return new StringSchema()
}
