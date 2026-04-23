import { formatLiteral } from '../utils/format-literal'

import { type DefaultValueFactory, type PreprocessFn, type RefineOptions, type SchemaDefinition } from './base'
import { fail, ok, type ParseContext, type ParseResult, type RefinementContext } from './context'
import { FluentSchema } from './fluent'

export type LiteralValue = string | number | boolean

export class LiteralSchema<TLiteral extends LiteralValue, TOutput = TLiteral> extends FluentSchema<unknown, TOutput> {
  private readonly expected: TLiteral

  public constructor(expected: TLiteral, definition?: SchemaDefinition<TOutput>) {
    super(definition)
    this.expected = expected
  }

  public getExpected(): TLiteral {
    return this.expected
  }

  private fork<TNextOutput = TOutput>({
    expected = this.expected,
    patch = {},
  }: {
    expected?: TLiteral
    patch?: Partial<SchemaDefinition<TNextOutput>>
  } = {}): LiteralSchema<TLiteral, TNextOutput> {
    return new LiteralSchema(expected, this.nextDefinition<TNextOutput>(patch))
  }

  public optional(): LiteralSchema<TLiteral, TOutput | undefined> {
    return this.fork<TOutput | undefined>({
      patch: this.optionalDefinition<TOutput | undefined>(),
    })
  }

  public required(message = this.definition.requiredMessage): LiteralSchema<TLiteral, Exclude<TOutput, undefined>> {
    return this.fork<Exclude<TOutput, undefined>>({
      patch: this.requiredDefinition<Exclude<TOutput, undefined>>(message),
    })
  }

  public nullable(): LiteralSchema<TLiteral, TOutput | null> {
    return this.fork<TOutput | null>({
      patch: this.nullableDefinition<TOutput | null>(),
    })
  }

  public nonnullable(message = this.definition.nonnullableMessage): LiteralSchema<TLiteral, Exclude<TOutput, null>> {
    return this.fork<Exclude<TOutput, null>>({
      patch: this.nonnullableDefinition<Exclude<TOutput, null>>(message),
    })
  }

  public default(
    factory: DefaultValueFactory<Exclude<TOutput, undefined>>
  ): LiteralSchema<TLiteral, Exclude<TOutput, undefined>> {
    return this.fork<Exclude<TOutput, undefined>>({
      patch: this.defaultDefinition(factory),
    })
  }

  public preprocess(fn: PreprocessFn): LiteralSchema<TLiteral, TOutput> {
    return this.fork({
      patch: this.preprocessDefinition(fn),
    })
  }

  public refine(
    check: (value: TLiteral, context: RefinementContext) => void | boolean,
    options: RefineOptions
  ): LiteralSchema<TLiteral, TOutput> {
    return this.fork({
      patch: this.refinementDefinition<TLiteral>(check, options, 'literal.refine'),
    })
  }

  protected _parse(input: unknown, context: ParseContext): ParseResult<unknown> {
    if (!Object.is(input, this.expected)) {
      context.addIssue({
        code: 'literal.value',
        message: `Must be ${formatLiteral(this.expected)}`,
        input,
        meta: {
          expected: this.expected,
        },
      })

      return fail()
    }

    return ok(this.expected)
  }
}

export function literal<TLiteral extends LiteralValue>(value: TLiteral): LiteralSchema<TLiteral> {
  return new LiteralSchema(value)
}
