import type { AnySchema } from './base'
import type { BooleanSchema } from './boolean'
import type { NumberSchema } from './number'
import type { StringSchema } from './string'

export type SchemaExtension<TSchema extends AnySchema> = (schema: TSchema) => TSchema

export function defineExtension<TSchema extends AnySchema, TArgs extends unknown[]>(
  factory: (...args: TArgs) => SchemaExtension<TSchema>
): (...args: TArgs) => SchemaExtension<TSchema> {
  return factory
}

export function defineStringExtension<TArgs extends unknown[]>(
  factory: (...args: TArgs) => (schema: StringSchema<string>) => StringSchema<string>
) {
  return defineExtension<StringSchema<string>, TArgs>(factory)
}

export function defineNumberExtension<TArgs extends unknown[]>(
  factory: (...args: TArgs) => (schema: NumberSchema<number>) => NumberSchema<number>
) {
  return defineExtension<NumberSchema<number>, TArgs>(factory)
}

export function defineBooleanExtension<TArgs extends unknown[]>(
  factory: (...args: TArgs) => (schema: BooleanSchema<boolean>) => BooleanSchema<boolean>
) {
  return defineExtension<BooleanSchema<boolean>, TArgs>(factory)
}
