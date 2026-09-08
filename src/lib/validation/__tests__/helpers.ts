import type { ValidationContext, Validator } from '../types'

const context: ValidationContext = {
  root: undefined,
  parent: undefined,
  path: [],
}

export const shouldValidate = <T>(validator: Validator<T>, value: T): boolean => {
  return validator.validate(value, context)
}
