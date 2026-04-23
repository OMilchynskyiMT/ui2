import type { Schema } from './base'

export type SchemaExtension<TSchema extends Schema<unknown, unknown>> = (schema: TSchema) => TSchema

export function defineExtension<TSchema extends Schema<unknown, unknown>, TArgs extends unknown[]>(
  factory: (...args: TArgs) => SchemaExtension<TSchema>
): (...args: TArgs) => SchemaExtension<TSchema> {
  return factory
}
