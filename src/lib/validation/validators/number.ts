import { defineValidator } from '../index'
import type { Validator, ValidatorOptions } from '../types'

export const min = (min: number, options: ValidatorOptions = {}): Validator<number> => {
  return defineValidator({
    code: 'number.min',
    message: options.message ?? `Must be at least ${min}`,
    validate: value => value >= min,
  })
}

export const max = (max: number, options: ValidatorOptions = {}): Validator<number> => {
  return defineValidator({
    code: 'number.max',
    message: options.message ?? `Must be at most ${max}`,
    validate: value => value <= max,
  })
}

export const inRange = (min: number, max: number, options: ValidatorOptions = {}): Validator<number> => {
  return defineValidator({
    code: 'number.inRange',
    message: options.message ?? `Must be between ${min} and ${max}`,
    validate: value => value >= min && value <= max,
  })
}

export const integer = (options: ValidatorOptions = {}): Validator<number> => {
  return defineValidator({
    code: 'number.integer',
    message: options.message ?? 'Must be an integer',
    validate: value => Number.isSafeInteger(value),
  })
}

export const positive = (options: ValidatorOptions = {}): Validator<number> => {
  return defineValidator({
    code: 'number.positive',
    message: options.message ?? 'Must be a positive number',
    validate: value => value > 0,
  })
}

export const negative = (options: ValidatorOptions = {}): Validator<number> => {
  return defineValidator({
    code: 'number.negative',
    message: options.message ?? 'Must be a negative number',
    validate: value => value < 0,
  })
}
