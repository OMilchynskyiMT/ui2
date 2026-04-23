import type { ValidationObjectMode } from '../model/options'
import { isPlainObject } from '../utils/is-plain-object'

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

export type ObjectShape = Record<string, RuntimeSchema<unknown, unknown>>
type EmptyShape = Record<never, RuntimeSchema<unknown, unknown>>
type FrozenShape<TShape extends ObjectShape> = Readonly<TShape>

type Simplify<T> = { [K in keyof T]: T[K] } & Record<never, never>

type OptionalKeys<TShape extends ObjectShape> = {
  [K in keyof TShape]-?: undefined extends InferSchemaOutput<TShape[K]> ? K : never
}[keyof TShape]

type RequiredKeys<TShape extends ObjectShape> = Exclude<keyof TShape, OptionalKeys<TShape>>

export type InferObjectOutput<TShape extends ObjectShape> = Simplify<
  { [K in RequiredKeys<TShape>]: InferSchemaOutput<TShape[K]> } & {
    [K in OptionalKeys<TShape>]?: Exclude<InferSchemaOutput<TShape[K]>, undefined>
  }
>

function keysOf<T extends Record<string, unknown>>(value: T): Extract<keyof T, string>[] {
  return Object.keys(value) as Extract<keyof T, string>[]
}

function getShapeSchema<TShape extends ObjectShape, TKey extends Extract<keyof TShape, string>>(
  shape: TShape,
  key: TKey
): TShape[TKey] {
  return shape[key]
}

const EMPTY_SHAPE: EmptyShape = Object.freeze({})

export class ObjectSchema<
  TShape extends ObjectShape = EmptyShape,
  TOutput = InferObjectOutput<TShape>,
> extends FluentSchema<unknown, TOutput> {
  private readonly shape: FrozenShape<TShape>
  private readonly objectMode?: ValidationObjectMode

  public constructor(shape?: TShape, objectMode?: ValidationObjectMode, definition?: SchemaDefinition<TOutput>) {
    super(definition)
    this.shape = Object.freeze({ ...(shape ?? EMPTY_SHAPE) }) as FrozenShape<TShape>
    this.objectMode = objectMode
  }

  public getShape(): FrozenShape<TShape> {
    return this.shape
  }

  private fork<TNextShape extends ObjectShape = TShape, TNextOutput = TOutput>({
    shape = this.shape as unknown as TNextShape,
    objectMode = this.objectMode,
    patch = {},
  }: {
    shape?: TNextShape
    objectMode?: ValidationObjectMode
    patch?: Partial<SchemaDefinition<TNextOutput>>
  } = {}): ObjectSchema<TNextShape, TNextOutput> {
    return new ObjectSchema(shape, objectMode, this.nextDefinition<TNextOutput>(patch))
  }

  public items<TNextShape extends ObjectShape>(
    shape: TNextShape
  ): ObjectSchema<TNextShape, InferObjectOutput<TNextShape>> {
    return this.fork<TNextShape, InferObjectOutput<TNextShape>>({
      shape,
    })
  }

  public optional(): ObjectSchema<TShape, TOutput | undefined> {
    return this.fork<TShape, TOutput | undefined>({
      patch: this.optionalDefinition<TOutput | undefined>(),
    })
  }

  public required(message = this.definition.requiredMessage): ObjectSchema<TShape, Exclude<TOutput, undefined>> {
    return this.fork<TShape, Exclude<TOutput, undefined>>({
      patch: this.requiredDefinition<Exclude<TOutput, undefined>>(message),
    })
  }

  public nullable(): ObjectSchema<TShape, TOutput | null> {
    return this.fork<TShape, TOutput | null>({
      patch: this.nullableDefinition<TOutput | null>(),
    })
  }

  public nonnullable(message = this.definition.nonnullableMessage): ObjectSchema<TShape, Exclude<TOutput, null>> {
    return this.fork<TShape, Exclude<TOutput, null>>({
      patch: this.nonnullableDefinition<Exclude<TOutput, null>>(message),
    })
  }

  public default(
    factory: DefaultValueFactory<Exclude<TOutput, undefined>>
  ): ObjectSchema<TShape, Exclude<TOutput, undefined>> {
    return this.fork<TShape, Exclude<TOutput, undefined>>({
      patch: this.defaultDefinition(factory),
    })
  }

  public preprocess(fn: PreprocessFn): ObjectSchema<TShape, TOutput> {
    return this.fork({
      patch: this.preprocessDefinition(fn),
    })
  }

  public refine(
    check: (value: InferObjectOutput<TShape>, context: RefinementContext) => void | boolean,
    options: RefineOptions
  ): ObjectSchema<TShape, TOutput> {
    return this.fork({
      patch: this.refinementDefinition<InferObjectOutput<TShape>>(check, options, 'object.refine'),
    })
  }

  public stripUnknown(): ObjectSchema<TShape, TOutput> {
    return this.fork({
      objectMode: 'strip',
    })
  }

  public allowUnknown(): ObjectSchema<TShape, TOutput> {
    return this.fork({
      objectMode: 'allow',
    })
  }

  public exact(): ObjectSchema<TShape, TOutput> {
    return this.fork({
      objectMode: 'exact',
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

    const issueCountBefore = context.issues.length
    const source = input
    const output: Record<string, unknown> = {}
    const mode = this.objectMode ?? context.options.objectMode

    for (const key of keysOf(this.shape)) {
      const schema = getShapeSchema(this.shape, key)
      const result = schema._run(source[key], context.child(key))

      if (result.ok && result.value !== undefined) {
        output[key] = result.value
      }
    }

    if (mode === 'allow') {
      for (const key of keysOf(source)) {
        if (!(key in this.shape)) {
          output[key] = source[key]
        }
      }
    }

    if (mode === 'exact') {
      for (const key of keysOf(source)) {
        if (!(key in this.shape)) {
          context.child(key).addIssue({
            code: 'object.unknown',
            message: 'Unknown key',
            input: source[key],
          })
        }
      }
    }

    if (context.issues.length > issueCountBefore) {
      return fail()
    }

    return ok(output as TOutput)
  }
}

export function object(): ObjectSchema<EmptyShape> {
  return new ObjectSchema()
}
