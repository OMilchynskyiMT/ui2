import {
  BaseSchema,
  cloneSchemaDefinition,
  type DefaultValueFactory,
  type PreprocessFn,
  type RefineOptions,
  type SchemaDefinition,
} from './base'
import type { RefinementContext } from './context'
import { EffectsSchema } from './effects'
import type { SchemaExtension } from './extension'

export abstract class FluentSchema<Input = unknown, Output = Input> extends BaseSchema<Input, Output> {
  public transform<TNextOutput>(fn: (value: Output) => TNextOutput): EffectsSchema<Input, TNextOutput> {
    return new EffectsSchema<Input, TNextOutput>(this, {
      transform: value => fn(value as Output),
    })
  }

  public use(extension: SchemaExtension<this>): this {
    return extension(this)
  }

  protected nextDefinition<TNextOutput>(
    patch: Partial<SchemaDefinition<TNextOutput>> = {}
  ): SchemaDefinition<TNextOutput> {
    const base = this.definition as unknown as SchemaDefinition<TNextOutput>

    return cloneSchemaDefinition(base, patch)
  }

  protected optionalDefinition<TNextOutput = Output | undefined>(): SchemaDefinition<TNextOutput> {
    return this.nextDefinition<TNextOutput>({
      isOptional: true,
    })
  }

  protected requiredDefinition<TNextOutput = Exclude<Output, undefined>>(
    message = this.definition.requiredMessage
  ): SchemaDefinition<TNextOutput> {
    return this.nextDefinition<TNextOutput>({
      isOptional: false,
      requiredMessage: message,
    })
  }

  protected nullableDefinition<TNextOutput = Output | null>(): SchemaDefinition<TNextOutput> {
    return this.nextDefinition<TNextOutput>({
      isNullable: true,
    })
  }

  protected nonnullableDefinition<TNextOutput = Exclude<Output, null>>(
    message = this.definition.nonnullableMessage
  ): SchemaDefinition<TNextOutput> {
    return this.nextDefinition<TNextOutput>({
      isNullable: false,
      nonnullableMessage: message,
    })
  }

  protected defaultDefinition(
    factory: DefaultValueFactory<Exclude<Output, undefined>>
  ): SchemaDefinition<Exclude<Output, undefined>> {
    return this.nextDefinition<Exclude<Output, undefined>>({
      isOptional: false,
      defaultValue: factory,
    })
  }

  protected preprocessDefinition<TNextOutput = Output>(fn: PreprocessFn): SchemaDefinition<TNextOutput> {
    return this.nextDefinition<TNextOutput>({
      preprocessors: [...this.definition.preprocessors, fn],
    })
  }

  protected refinementDefinition<TValue, TNextOutput = Output>(
    check: (value: TValue, context: RefinementContext) => void | boolean,
    options: RefineOptions,
    fallbackCode: string
  ): SchemaDefinition<TNextOutput> {
    return this.nextDefinition<TNextOutput>({
      refinements: [
        ...this.definition.refinements,
        {
          code: options.code ?? fallbackCode,
          message: options.message,
          check: (value, context) => check(value as TValue, context),
        },
      ],
    })
  }
}
