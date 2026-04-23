import {
  type DefaultValueFactory,
  type InferSchemaOutput,
  type PreprocessFn,
  type RefineOptions,
  type RuntimeSchema,
  type SchemaDefinition,
} from './base'
import { fail, ok, type ParseContext, type ParseResult, type RefinementContext } from './context'
import { FluentSchema } from './fluent'

export type InferArrayOutput<TItemSchema extends RuntimeSchema<unknown, unknown>> = InferSchemaOutput<TItemSchema>[]

export class ArraySchema<
  TItemSchema extends RuntimeSchema<unknown, unknown>,
  TOutput = InferArrayOutput<TItemSchema>,
> extends FluentSchema<unknown, TOutput> {
  private readonly itemSchema: TItemSchema

  public constructor(itemSchema: TItemSchema, definition?: SchemaDefinition<TOutput>) {
    super(definition)
    this.itemSchema = itemSchema
  }

  private fork<TNextItemSchema extends RuntimeSchema<unknown, unknown> = TItemSchema, TNextOutput = TOutput>({
    itemSchema = this.itemSchema as unknown as TNextItemSchema,
    patch = {},
  }: {
    itemSchema?: TNextItemSchema
    patch?: Partial<SchemaDefinition<TNextOutput>>
  } = {}): ArraySchema<TNextItemSchema, TNextOutput> {
    return new ArraySchema(itemSchema, this.nextDefinition<TNextOutput>(patch))
  }

  public items<TNextItemSchema extends RuntimeSchema<unknown, unknown>>(
    itemSchema: TNextItemSchema
  ): ArraySchema<TNextItemSchema, InferArrayOutput<TNextItemSchema>> {
    return this.fork<TNextItemSchema, InferArrayOutput<TNextItemSchema>>({
      itemSchema,
    })
  }

  public optional(): ArraySchema<TItemSchema, TOutput | undefined> {
    return this.fork<TItemSchema, TOutput | undefined>({
      patch: this.optionalDefinition<TOutput | undefined>(),
    })
  }

  public required(message = this.definition.requiredMessage): ArraySchema<TItemSchema, Exclude<TOutput, undefined>> {
    return this.fork<TItemSchema, Exclude<TOutput, undefined>>({
      patch: this.requiredDefinition<Exclude<TOutput, undefined>>(message),
    })
  }

  public nullable(): ArraySchema<TItemSchema, TOutput | null> {
    return this.fork<TItemSchema, TOutput | null>({
      patch: this.nullableDefinition<TOutput | null>(),
    })
  }

  public nonnullable(message = this.definition.nonnullableMessage): ArraySchema<TItemSchema, Exclude<TOutput, null>> {
    return this.fork<TItemSchema, Exclude<TOutput, null>>({
      patch: this.nonnullableDefinition<Exclude<TOutput, null>>(message),
    })
  }

  public default(
    factory: DefaultValueFactory<Exclude<TOutput, undefined>>
  ): ArraySchema<TItemSchema, Exclude<TOutput, undefined>> {
    return this.fork<TItemSchema, Exclude<TOutput, undefined>>({
      patch: this.defaultDefinition(factory),
    })
  }

  public preprocess(fn: PreprocessFn): ArraySchema<TItemSchema, TOutput> {
    return this.fork({
      patch: this.preprocessDefinition(fn),
    })
  }

  public refine(
    check: (value: InferArrayOutput<TItemSchema>, context: RefinementContext) => void | boolean,
    options: RefineOptions
  ): ArraySchema<TItemSchema, TOutput> {
    return this.fork({
      patch: this.refinementDefinition<InferArrayOutput<TItemSchema>>(check, options, 'array.refine'),
    })
  }

  public min(length: number, message = `Must contain at least ${length} items`): ArraySchema<TItemSchema, TOutput> {
    return this.refine(value => value.length >= length, {
      code: 'array.min',
      message,
    })
  }

  public max(length: number, message = `Must contain at most ${length} items`): ArraySchema<TItemSchema, TOutput> {
    return this.refine(value => value.length <= length, {
      code: 'array.max',
      message,
    })
  }

  public length(
    expected: number,
    message = `Must contain exactly ${expected} items`
  ): ArraySchema<TItemSchema, TOutput> {
    return this.refine(value => value.length === expected, {
      code: 'array.length',
      message,
    })
  }

  protected _parse(input: unknown, context: ParseContext): ParseResult<unknown> {
    if (!Array.isArray(input)) {
      context.addIssue({
        code: 'array.type',
        message: 'Must be an array',
        input,
      })

      return fail()
    }

    const issueCountBefore = context.issues.length
    const output: unknown[] = []

    for (const [index, item] of input.entries()) {
      const result = this.itemSchema._run(item, context.child(index))

      if (result.ok) {
        output.push(result.value)
      }
    }

    if (context.issues.length > issueCountBefore) {
      return fail()
    }

    return ok(output as TOutput)
  }
}

export function array<TItemSchema extends RuntimeSchema<unknown, unknown>>(
  itemSchema: TItemSchema
): ArraySchema<TItemSchema> {
  return new ArraySchema(itemSchema)
}
