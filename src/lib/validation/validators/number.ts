import type { Validator, ValidatorOptions } from '../types'

const assertFinite = (value: number, name: string): void => {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number`)
}

const assertRange = (min: number, max: number): void => {
  assertFinite(min, 'min')
  assertFinite(max, 'max')
  if (min > max) throw new RangeError('min must not be greater than max')
}

export const min = (min: number, options?: ValidatorOptions): Validator<number> => {
  assertFinite(min, 'min')

  return {
    code: 'number.min',
    message: options?.message ?? `Must be at least ${min}`,
    validate: value => value >= min,
  }
}

export const max = (max: number, options?: ValidatorOptions): Validator<number> => {
  assertFinite(max, 'max')

  return {
    code: 'number.max',
    message: options?.message ?? `Must be at most ${max}`,
    validate: value => value <= max,
  }
}

export const inRange = (min: number, max: number, options?: ValidatorOptions): Validator<number> => {
  assertRange(min, max)

  return {
    code: 'number.inRange',
    message: options?.message ?? `Must be between ${min} and ${max}`,
    validate: value => value >= min && value <= max,
  }
}

export type NumberRange = readonly [min: number, max: number]

export const inRanges = (
  ranges: readonly NumberRange[],
  options?: ValidatorOptions & Readonly<{ include?: readonly number[] }>
): Validator<number> => {
  if (ranges.length === 0 && (options?.include?.length ?? 0) === 0) {
    throw new TypeError('ranges or include must contain at least one accepted value')
  }

  for (const [lower, upper] of ranges) {
    assertRange(lower, upper)
  }

  if (options?.include?.some(value => !Number.isFinite(value)) === true) {
    throw new RangeError('Included values must be finite numbers')
  }

  const included = new Set(options?.include)
  const rangeMessage = ranges.map(([lower, upper]) => `${lower}-${upper}`).join(', ')
  const includedMessage = [...included].join(', ')
  const expected = [rangeMessage, includedMessage].filter(Boolean).join(' or ')

  return {
    code: 'number.inRanges',
    message: options?.message ?? `Must be within ${expected}`,
    validate: value => included.has(value) || ranges.some(([lower, upper]) => value >= lower && value <= upper),
  }
}

export const integer = (options?: ValidatorOptions): Validator<number> => {
  return {
    code: 'number.integer',
    message: options?.message ?? 'Must be an integer',
    // eslint-disable-next-line unicorn/prefer-number-is-safe-integer
    validate: value => Number.isInteger(value),
  }
}

export const positive = (options?: ValidatorOptions): Validator<number> => {
  return {
    code: 'number.positive',
    message: options?.message ?? 'Must be a positive number',
    validate: value => value > 0,
  }
}

export const negative = (options?: ValidatorOptions): Validator<number> => {
  return {
    code: 'number.negative',
    message: options?.message ?? 'Must be a negative number',
    validate: value => value < 0,
  }
}
