import { coerceToNumber, emptyStringAsUndefined } from '../utils/coerce'

import { type DefaultValueFactory, type PreprocessFn, type RefineOptions, type SchemaDefinition } from './base'
import { fail, ok, type ParseContext, type ParseResult, type RefinementContext } from './context'
import { FluentSchema } from './fluent'

export class NumberSchema<TOutput = number> extends FluentSchema<unknown, TOutput> {
  public constructor(definition?: SchemaDefinition<TOutput>) {
    super(definition)
  }

  public optional(): NumberSchema<TOutput | undefined> {
    return new NumberSchema(this.optionalDefinition<TOutput | undefined>())
  }

  public required(message = this.definition.requiredMessage): NumberSchema<Exclude<TOutput, undefined>> {
    return new NumberSchema(this.requiredDefinition<Exclude<TOutput, undefined>>(message))
  }

  public nullable(): NumberSchema<TOutput | null> {
    return new NumberSchema(this.nullableDefinition<TOutput | null>())
  }

  public nonnullable(message = this.definition.nonnullableMessage): NumberSchema<Exclude<TOutput, null>> {
    return new NumberSchema(this.nonnullableDefinition<Exclude<TOutput, null>>(message))
  }

  public default(factory: DefaultValueFactory<Exclude<TOutput, undefined>>): NumberSchema<Exclude<TOutput, undefined>> {
    return new NumberSchema(this.defaultDefinition(factory))
  }

  public preprocess(fn: PreprocessFn): NumberSchema<TOutput> {
    return new NumberSchema(this.preprocessDefinition(fn))
  }

  public coerce(): NumberSchema<TOutput> {
    return this.preprocess(coerceToNumber)
  }

  public emptyAsUndefined(): NumberSchema<TOutput> {
    return this.preprocess(emptyStringAsUndefined)
  }

  public refine(
    check: (value: number, context: RefinementContext) => void | boolean,
    options: RefineOptions
  ): NumberSchema<TOutput> {
    return new NumberSchema(this.refinementDefinition<number>(check, options, 'number.refine'))
  }

  public min(limit: number, message = `Must be at least ${limit}`): NumberSchema<TOutput> {
    return this.refine(value => value >= limit, {
      code: 'number.min',
      message,
    })
  }

  public max(limit: number, message = `Must be at most ${limit}`): NumberSchema<TOutput> {
    return this.refine(value => value <= limit, {
      code: 'number.max',
      message,
    })
  }

  public integer(message = 'Must be an integer'): NumberSchema<TOutput> {
    return this.refine(value => Number.isInteger(value), {
      code: 'number.integer',
      message,
    })
  }

  protected _parse(input: unknown, context: ParseContext): ParseResult<unknown> {
    if (typeof input !== 'number' || !Number.isFinite(input)) {
      context.addIssue({
        code: 'number.type',
        message: 'Must be a number',
        input,
      })

      return fail()
    }

    return ok(input)
  }
}

export function number(): NumberSchema<number> {
  return new NumberSchema()
}
