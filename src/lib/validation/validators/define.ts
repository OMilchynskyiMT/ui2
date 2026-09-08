import type { Validator } from '../types'

export const defineValidator = <T>(validator: Validator<T>): Validator<T> => validator
