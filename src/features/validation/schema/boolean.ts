import { coerceToBoolean } from '../utils/coerce'

import { type DefaultValueFactory, type PreprocessFn, type RefineOptions, type SchemaDefinition } from './base'
import { fail, ok, type ParseContext, type ParseResult, type RefinementContext } from './context'
import { FluentSchema } from './fluent'

export class BooleanSchema<TOutput = boolean> extends FluentSchema<unknown, TOutput> {
  public constructor(definition?: SchemaDefinition<TOutput>) {
    super(definition)
  }

  public optional(): BooleanSchema<TOutput | undefined> {
    return new BooleanSchema(this.optionalDefinition<TOutput | undefined>())
  }

  public required(message = this.definition.requiredMessage): BooleanSchema<Exclude<TOutput, undefined>> {
    return new BooleanSchema(this.requiredDefinition<Exclude<TOutput, undefined>>(message))
  }

  public nullable(): BooleanSchema<TOutput | null> {
    return new BooleanSchema(this.nullableDefinition<TOutput | null>())
  }

  public nonnullable(message = this.definition.nonnullableMessage): BooleanSchema<Exclude<TOutput, null>> {
    return new BooleanSchema(this.nonnullableDefinition<Exclude<TOutput, null>>(message))
  }

  public default(
    factory: DefaultValueFactory<Exclude<TOutput, undefined>>
  ): BooleanSchema<Exclude<TOutput, undefined>> {
    return new BooleanSchema(this.defaultDefinition(factory))
  }

  public preprocess(fn: PreprocessFn): BooleanSchema<TOutput> {
    return new BooleanSchema(this.preprocessDefinition(fn))
  }

  public coerce(): BooleanSchema<TOutput> {
    return this.preprocess(coerceToBoolean)
  }

  public refine(
    check: (value: boolean, context: RefinementContext) => void | boolean,
    options: RefineOptions
  ): BooleanSchema<TOutput> {
    return new BooleanSchema(this.refinementDefinition<boolean>(check, options, 'boolean.refine'))
  }

  protected _parse(input: unknown, context: ParseContext): ParseResult<unknown> {
    if (typeof input !== 'boolean') {
      context.addIssue({
        code: 'boolean.type',
        message: 'Must be a boolean',
        input,
      })

      return fail()
    }

    return ok(input)
  }
}

export function boolean(): BooleanSchema<boolean> {
  return new BooleanSchema()
}
