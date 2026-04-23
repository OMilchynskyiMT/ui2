import type { ValidationIssue } from '../model/issues'

import {
  type DefaultValueFactory,
  type InferSchemaOutput,
  type PreprocessFn,
  type RefineOptions,
  type RuntimeSchema,
  type SchemaDefinition,
} from './base'
import {
  createChildParseContext,
  fail,
  ok,
  type ParseContext,
  type ParseResult,
  type RefinementContext,
} from './context'
import { FluentSchema } from './fluent'

export type UnionMembers = readonly RuntimeSchema<unknown, unknown>[]

export type NonEmptyUnionMembers = readonly [
  RuntimeSchema<unknown, unknown>,
  RuntimeSchema<unknown, unknown>,
  ...RuntimeSchema<unknown, unknown>[],
]

export type InferUnionOutput<TMembers extends UnionMembers> = InferSchemaOutput<TMembers[number]>

export class UnionSchema<TMembers extends UnionMembers, TOutput = InferUnionOutput<TMembers>> extends FluentSchema<
  unknown,
  TOutput
> {
  private readonly members: TMembers

  public constructor(members: TMembers, definition?: SchemaDefinition<TOutput>) {
    super(definition)
    this.members = members
  }

  private fork<TNextOutput = TOutput>({
    members = this.members,
    patch = {},
  }: {
    members?: TMembers
    patch?: Partial<SchemaDefinition<TNextOutput>>
  } = {}): UnionSchema<TMembers, TNextOutput> {
    return new UnionSchema(members, this.nextDefinition<TNextOutput>(patch))
  }

  public optional(): UnionSchema<TMembers, TOutput | undefined> {
    return this.fork<TOutput | undefined>({
      patch: this.optionalDefinition<TOutput | undefined>(),
    })
  }

  public required(message = this.definition.requiredMessage): UnionSchema<TMembers, Exclude<TOutput, undefined>> {
    return this.fork<Exclude<TOutput, undefined>>({
      patch: this.requiredDefinition<Exclude<TOutput, undefined>>(message),
    })
  }

  public nullable(): UnionSchema<TMembers, TOutput | null> {
    return this.fork<TOutput | null>({
      patch: this.nullableDefinition<TOutput | null>(),
    })
  }

  public nonnullable(message = this.definition.nonnullableMessage): UnionSchema<TMembers, Exclude<TOutput, null>> {
    return this.fork<Exclude<TOutput, null>>({
      patch: this.nonnullableDefinition<Exclude<TOutput, null>>(message),
    })
  }

  public default(
    factory: DefaultValueFactory<Exclude<TOutput, undefined>>
  ): UnionSchema<TMembers, Exclude<TOutput, undefined>> {
    return this.fork<Exclude<TOutput, undefined>>({
      patch: this.defaultDefinition(factory),
    })
  }

  public preprocess(fn: PreprocessFn): UnionSchema<TMembers, TOutput> {
    return this.fork({
      patch: this.preprocessDefinition(fn),
    })
  }

  public refine(
    check: (value: InferUnionOutput<TMembers>, context: RefinementContext) => void | boolean,
    options: RefineOptions
  ): UnionSchema<TMembers, TOutput> {
    return this.fork({
      patch: this.refinementDefinition<InferUnionOutput<TMembers>>(check, options, 'union.refine'),
    })
  }

  protected _parse(input: unknown, context: ParseContext): ParseResult<unknown> {
    const branches: { index: number; issues: ValidationIssue[] }[] = []

    for (const [index, member] of this.members.entries()) {
      const branchIssues: ValidationIssue[] = []
      const branchContext = createChildParseContext(branchIssues, context.options, context.path)

      const result = member._run(input, branchContext)

      if (result.ok && branchIssues.length === 0) {
        return ok(result.value)
      }

      branches.push({
        index,
        issues: branchIssues,
      })
    }

    context.addIssue({
      code: 'union.no_match',
      message: 'Must match one of the allowed schemas',
      input,
      meta: {
        branches,
      },
    })

    return fail()
  }
}

export function union<TMembers extends NonEmptyUnionMembers>(...members: TMembers): UnionSchema<TMembers> {
  return new UnionSchema(members)
}
