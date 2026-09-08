import { defineValidator } from '../index'
import type { Validator, ValidatorOptions } from '../types'

export const minLength = (length: number, options: ValidatorOptions = {}): Validator<string> => {
  return defineValidator({
    code: 'string.minLength',
    message: options.message ?? `Must contain at least ${length} characters`,
    validate: value => value.length >= length,
  })
}

export const maxLength = (length: number, options: ValidatorOptions = {}): Validator<string> => {
  return defineValidator({
    code: 'string.maxLength',
    message: options.message ?? `Must contain at most ${length} characters`,
    validate: value => value.length <= length,
  })
}

export const inRange = (min: number, max: number, options: ValidatorOptions = {}): Validator<string> => {
  return defineValidator({
    code: 'string.inRange',
    message: options.message ?? `Must contain between ${min} and ${max} characters`,
    validate: value => value.length >= min && value.length <= max,
  })
}

export const oneOf = <T extends string | number>(
  values: readonly T[],
  options: ValidatorOptions = {}
): Validator<T> => {
  const allowed = new Set<T>(values)

  return defineValidator<T>({
    code: 'string.oneOf',
    message: options.message ?? `Must be one of: ${values.join(', ')}`,
    validate: value => allowed.has(value),
  })
}

export const matches = (pattern: RegExp, options: ValidatorOptions = {}): Validator<string> => {
  const expression = new RegExp(pattern.source, pattern.flags)

  return defineValidator({
    code: 'string.pattern',
    message: options.message ?? 'Does not match pattern',
    validate: value => {
      expression.lastIndex = 0
      return expression.test(value)
    },
  })
}

// TODO: align with actual regex
export const email = (options: ValidatorOptions = {}): Validator<string> => {
  return matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: options.message ?? 'Invalid email address',
  })
}
