import type { Validator, ValidatorOptions } from '../types'

const assertLength = (length: number, name = 'length'): void => {
  if (!Number.isSafeInteger(length) || length < 0) {
    throw new RangeError(`${name} must be a non-negative integer`)
  }
}

const assertLengthRange = (min: number, max: number): void => {
  assertLength(min, 'min')
  assertLength(max, 'max')
  if (min > max) throw new RangeError('min must not be greater than max')
}

export const nonBlank = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'string.nonBlank',
    message: options?.message ?? 'Must not be blank',
    validate: value => value.trim().length > 0,
  }
}

export const length = (length: number, options?: ValidatorOptions): Validator<string> => {
  assertLength(length)

  return {
    code: 'string.length',
    message: options?.message ?? `Must contain exactly ${length} characters`,
    validate: value => value.length === length,
  }
}

export const minLength = (length: number, options?: ValidatorOptions): Validator<string> => {
  assertLength(length)

  return {
    code: 'string.minLength',
    message: options?.message ?? `Must contain at least ${length} characters`,
    validate: value => value.length >= length,
  }
}

export const maxLength = (length: number, options?: ValidatorOptions): Validator<string> => {
  assertLength(length)

  return {
    code: 'string.maxLength',
    message: options?.message ?? `Must contain at most ${length} characters`,
    validate: value => value.length <= length,
  }
}

export const inRange = (min: number, max: number, options?: ValidatorOptions): Validator<string> => {
  assertLengthRange(min, max)

  return {
    code: 'string.inRange',
    message: options?.message ?? `Must contain between ${min} and ${max} characters`,
    validate: value => value.length >= min && value.length <= max,
  }
}

export const startsWith = (prefix: string, options?: ValidatorOptions): Validator<string> => {
  if (prefix.length === 0) throw new TypeError('prefix must not be empty')

  return {
    code: 'string.startsWith',
    message: options?.message ?? `Must start with ${prefix}`,
    validate: value => value.startsWith(prefix),
  }
}

export const endsWith = (suffix: string, options?: ValidatorOptions): Validator<string> => {
  if (suffix.length === 0) throw new TypeError('suffix must not be empty')

  return {
    code: 'string.endsWith',
    message: options?.message ?? `Must end with ${suffix}`,
    validate: value => value.endsWith(suffix),
  }
}

export const matches = (pattern: RegExp, options?: ValidatorOptions): Validator<string> => {
  const expression = new RegExp(pattern.source, pattern.flags)

  return {
    code: 'string.pattern',
    message: options?.message ?? 'Does not match pattern',
    validate: value => {
      expression.lastIndex = 0
      return expression.test(value)
    },
  }
}

const emailPattern =
  /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(\.+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/

export const email = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'string.email',
    message: options?.message ?? 'Invalid email address',
    validate: value => emailPattern.test(value),
  }
}
