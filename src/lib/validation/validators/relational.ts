import type { ValidationContext, Validator, ValidatorOptions } from '../types'
import { type ContextValue, resolveContextValue } from './context'

type Comparable = string | number | boolean | bigint | null | undefined

type UniqueByOptions<T> = ValidatorOptions &
  Readonly<{
    ignoreCase?: boolean
    exclude?: (existing: T, value: T, context: ValidationContext) => boolean
  }>

const areEqual = (left: Comparable, right: Comparable, shouldIgnoreCase: boolean): boolean => {
  if (shouldIgnoreCase && typeof left === 'string' && typeof right === 'string') {
    return left.toLowerCase() === right.toLowerCase()
  }

  return Object.is(left, right)
}

export const sameAs = <T>(expected: ContextValue<T>, options?: ValidatorOptions): Validator<T> => {
  return {
    code: 'relational.sameAs',
    message: options?.message ?? 'Must match the expected value',
    validate: (value, context) => Object.is(value, resolveContextValue(expected, context)),
  }
}

export const uniqueBy = <T>(
  values: ContextValue<readonly T[]>,
  selector: (value: T) => Comparable,
  options?: UniqueByOptions<T>
): Validator<T> => {
  return {
    code: 'relational.uniqueBy',
    message: options?.message ?? 'Must be unique',
    validate: (value, context) =>
      !resolveContextValue(values, context).some(existing => {
        if (options?.exclude?.(existing, value, context) === true) return false
        return areEqual(selector(existing), selector(value), options?.ignoreCase === true)
      }),
  }
}

export const greaterThanOrEqual = (
  expected: ContextValue<number>,
  options?: ValidatorOptions
): Validator<number> => {
  return {
    code: 'relational.greaterThanOrEqual',
    message: options?.message ?? 'Must not be lower than the related value',
    validate: (value, context) => {
      const expectedValue = resolveContextValue(expected, context)
      return !Number.isFinite(expectedValue) || value >= expectedValue
    },
  }
}

export const lessThanOrEqual = (
  expected: ContextValue<number>,
  options?: ValidatorOptions
): Validator<number> => {
  return {
    code: 'relational.lessThanOrEqual',
    message: options?.message ?? 'Must not be greater than the related value',
    validate: (value, context) => {
      const expectedValue = resolveContextValue(expected, context)
      return !Number.isFinite(expectedValue) || value <= expectedValue
    },
  }
}
