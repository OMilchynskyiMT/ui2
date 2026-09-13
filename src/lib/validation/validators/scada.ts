import type { Validator, ValidatorOptions } from '../types'
import { base64Data, hexDigits } from './format'

const propertyNamePattern = /^[\w-]+$/
const base64Payload = base64Data()
const hexadecimalPayload = hexDigits()

export const propertyName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'scada.propertyName',
    message: options?.message ?? 'Must contain letters, digits, underscores, or hyphens only',
    validate: value => propertyNamePattern.test(value),
  }
}

export const uplinkPayload = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'scada.uplinkPayload',
    message: options?.message ?? 'Must contain hexadecimal or Base64 payload data',
    validate: (value, context) =>
      value.length > 0 &&
      (hexadecimalPayload.validate(value, context) || base64Payload.validate(value, context)),
  }
}
