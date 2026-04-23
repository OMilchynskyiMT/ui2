import { formatLiteral, formatLiteralList } from '../utils/format-literal'
import { isPlainObject } from '../utils/is-plain-object'

import {
  type DefaultValueFactory,
  type InferSchemaOutput,
  type PreprocessFn,
  type RefineOptions,
  type SchemaDefinition,
} from './base'
import { fail, type ParseContext, type ParseResult, type RefinementContext } from './context'
import { FluentSchema } from './fluent'
import type { LiteralValue } from './literal'
import { LiteralSchema } from './literal'
import { ObjectSchema, type ObjectShape } from './object'

export type DiscriminatedUnionMember = ObjectSchema<ObjectShape, unknown>

export type NonEmptyDiscriminatedUnionMembers = readonly [
  DiscriminatedUnionMember,
  DiscriminatedUnionMember,
  ...DiscriminatedUnionMember[],
]

export type InferDiscriminatedUnionOutput<TMembers extends readonly DiscriminatedUnionMember[]> = InferSchemaOutput<
  TMembers[number]
>

function isLiteralValue(value: unknown): value is LiteralValue {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

function extractDiscriminatorValue(member: DiscriminatedUnionMember, discriminator: string): LiteralValue {
  const shape: ObjectShape = member.getShape()
  const schema = shape[discriminator]

  if (!schema || !(schema instanceof LiteralSchema)) {
    throw new TypeError(`Discriminated union member must define "${discriminator}" as literal()`)
  }

  return schema.getExpected()
}

function buildMembersByValue<TMembers extends readonly DiscriminatedUnionMember[]>(
  discriminator: string,
  members: TMembers
): Map<LiteralValue, TMembers[number]> {
  const result = new Map<LiteralValue, TMembers[number]>()

  for (const member of members) {
    const value = extractDiscriminatorValue(member, discriminator)

    if (result.has(value)) {
      throw new TypeError(`Duplicate discriminator value ${formatLiteral(value)} for "${discriminator}"`)
    }

    result.set(value, member)
  }

  return result
}

export class DiscriminatedUnionSchema<
  TKey extends string,
  TMembers extends readonly DiscriminatedUnionMember[],
  TOutput = InferDiscriminatedUnionOutput<TMembers>,
> extends FluentSchema<unknown, TOutput> {
  private readonly discriminator: TKey
  private readonly members: TMembers
  private readonly membersByValue: ReadonlyMap<LiteralValue, TMembers[number]>
  private readonly expectedValues: readonly LiteralValue[]

  public constructor(discriminator: TKey, members: TMembers, definition?: SchemaDefinition<TOutput>) {
    super(definition)

    this.discriminator = discriminator
    this.members = members
    this.membersByValue = buildMembersByValue(discriminator, members)
    this.expectedValues = Object.freeze([...this.membersByValue.keys()])
  }

  private fork<TNextOutput = TOutput>({
    discriminator = this.discriminator,
    members = this.members,
    patch = {},
  }: {
    discriminator?: TKey
    members?: TMembers
    patch?: Partial<SchemaDefinition<TNextOutput>>
  } = {}): DiscriminatedUnionSchema<TKey, TMembers, TNextOutput> {
    return new DiscriminatedUnionSchema(discriminator, members, this.nextDefinition<TNextOutput>(patch))
  }

  public optional(): DiscriminatedUnionSchema<TKey, TMembers, TOutput | undefined> {
    return this.fork<TOutput | undefined>({
      patch: this.optionalDefinition<TOutput | undefined>(),
    })
  }

  public required(
    message = this.definition.requiredMessage
  ): DiscriminatedUnionSchema<TKey, TMembers, Exclude<TOutput, undefined>> {
    return this.fork<Exclude<TOutput, undefined>>({
      patch: this.requiredDefinition<Exclude<TOutput, undefined>>(message),
    })
  }

  public nullable(): DiscriminatedUnionSchema<TKey, TMembers, TOutput | null> {
    return this.fork<TOutput | null>({
      patch: this.nullableDefinition<TOutput | null>(),
    })
  }

  public nonnullable(
    message = this.definition.nonnullableMessage
  ): DiscriminatedUnionSchema<TKey, TMembers, Exclude<TOutput, null>> {
    return this.fork<Exclude<TOutput, null>>({
      patch: this.nonnullableDefinition<Exclude<TOutput, null>>(message),
    })
  }

  public default(
    factory: DefaultValueFactory<Exclude<TOutput, undefined>>
  ): DiscriminatedUnionSchema<TKey, TMembers, Exclude<TOutput, undefined>> {
    return this.fork<Exclude<TOutput, undefined>>({
      patch: this.defaultDefinition(factory),
    })
  }

  public preprocess(fn: PreprocessFn): DiscriminatedUnionSchema<TKey, TMembers, TOutput> {
    return this.fork({
      patch: this.preprocessDefinition(fn),
    })
  }

  public refine(
    check: (value: InferDiscriminatedUnionOutput<TMembers>, context: RefinementContext) => void | boolean,
    options: RefineOptions
  ): DiscriminatedUnionSchema<TKey, TMembers, TOutput> {
    return this.fork({
      patch: this.refinementDefinition<InferDiscriminatedUnionOutput<TMembers>>(
        check,
        options,
        'discriminated_union.refine'
      ),
    })
  }

  protected _parse(input: unknown, context: ParseContext): ParseResult<unknown> {
    if (!isPlainObject(input)) {
      context.addIssue({
        code: 'object.type',
        message: 'Must be an object',
        input,
      })

      return fail()
    }

    const discriminatorValue = input[this.discriminator]

    if (discriminatorValue === undefined) {
      context.child(this.discriminator).addIssue({
        code: 'discriminated_union.discriminator.required',
        message: `Discriminator "${this.discriminator}" is required`,
        input: discriminatorValue,
        meta: {
          discriminator: this.discriminator,
          expected: this.expectedValues,
        },
      })

      return fail()
    }

    if (!isLiteralValue(discriminatorValue)) {
      context.child(this.discriminator).addIssue({
        code: 'discriminated_union.discriminator.invalid',
        message: `Discriminator "${this.discriminator}" must be one of: ${formatLiteralList(this.expectedValues)}`,
        input: discriminatorValue,
        meta: {
          discriminator: this.discriminator,
          expected: this.expectedValues,
        },
      })

      return fail()
    }

    const member = this.membersByValue.get(discriminatorValue)

    if (!member) {
      context.child(this.discriminator).addIssue({
        code: 'discriminated_union.discriminator.invalid',
        message: `Discriminator "${this.discriminator}" must be one of: ${formatLiteralList(this.expectedValues)}`,
        input: discriminatorValue,
        meta: {
          discriminator: this.discriminator,
          expected: this.expectedValues,
        },
      })

      return fail()
    }

    return member._run(input, context)
  }
}

export function discriminatedUnion<TKey extends string, TMembers extends NonEmptyDiscriminatedUnionMembers>(
  discriminator: TKey,
  ...members: TMembers
): DiscriminatedUnionSchema<TKey, TMembers> {
  return new DiscriminatedUnionSchema(discriminator, members)
}
