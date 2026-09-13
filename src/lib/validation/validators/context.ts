import type { ValidationContext } from '../types'

export type ContextValue<T> = T | ((context: ValidationContext) => T)

export const resolveContextValue = <T>(value: ContextValue<T>, context: ValidationContext): T => {
  return typeof value === 'function' ? (value as (context: ValidationContext) => T)(context) : value
}
