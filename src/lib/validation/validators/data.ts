import type { Validator, ValidatorOptions } from '../types'
const base64Pattern = /^(?:[a-z0-9+/]{4})*(?:[a-z0-9+/]{3}=|[a-z0-9+/]{2}==)?$/i
const digitsPattern = /^\d+$/
const alphanumericPattern = /^[\dA-Za-z]+$/
const hexDigitsPattern = /^[\dA-Fa-f]+$/
const lowercaseHexDigitsPattern = /^[\da-f]+$/
const hexPayloadPattern = /^(?:0x)?(?:[\da-f]{2})+$/i
const separatedHexDataPattern = /^[\da-f .:-]+$/i
const fragmentDescriptionPattern = /[\dA-Fa-f]{8}/

export const base64Data = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.base64',
    message: options?.message ?? 'Must be valid Base64 data',
    validate: value => base64Pattern.test(value),
  }
}

export const digits = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.digits',
    message: options?.message ?? 'Must contain digits only',
    validate: value => digitsPattern.test(value),
  }
}

export const alphanumeric = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.alphanumeric',
    message: options?.message ?? 'Must contain letters and digits only',
    validate: value => alphanumericPattern.test(value),
  }
}

export const hexDigits = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.hexDigits',
    message: options?.message ?? 'Must contain hexadecimal digits only',
    validate: value => hexDigitsPattern.test(value),
  }
}

export const lowercaseHexDigits = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.lowercaseHexDigits',
    message: options?.message ?? 'Must contain lowercase hexadecimal digits only',
    validate: value => lowercaseHexDigitsPattern.test(value),
  }
}

export const hexBytes = (
  byteLength: number,
  options?: ValidatorOptions & Readonly<{ allowPrefix?: boolean }>
): Validator<string> => {
  if (!Number.isSafeInteger(byteLength) || byteLength <= 0) {
    throw new RangeError('byteLength must be a positive integer')
  }

  const prefix = options?.allowPrefix === false ? '' : '(?:0x)?'
  const pattern = new RegExp(String.raw`^${prefix}[\da-f]{${byteLength * 2}}$`, 'i')

  return {
    code: 'format.hexBytes',
    message: options?.message ?? `Must contain exactly ${byteLength} bytes in hexadecimal`,
    validate: value => pattern.test(value),
  }
}

export const hexPayload = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.hexPayload',
    message: options?.message ?? 'Must contain a whole number of hexadecimal bytes',
    validate: value => hexPayloadPattern.test(value),
  }
}

export const separatedHexData = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.separatedHexData',
    message: options?.message ?? 'Must contain an even number of hexadecimal digits with optional separators',
    validate: value => {
      if (value.length === 0) return true
      if (!separatedHexDataPattern.test(value)) return false
      const payload = value.replaceAll(/[ .:-]/g, '')
      return payload.length % 2 === 0
    },
  }
}

const base64Payload = base64Data()
const hexadecimalPayload = hexDigits()

export const uplinkPayload = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'scada.uplinkPayload',
    message: options?.message ?? 'Must contain hexadecimal or Base64 payload data',
    validate: (value, context) =>
      value.length > 0 && (hexadecimalPayload.validate(value, context) || base64Payload.validate(value, context)),
  }
}

export const fragmentDescription = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.fragmentDescription',
    message: options?.message ?? 'Must contain a 4-byte hexadecimal fragment description',
    validate: value => fragmentDescriptionPattern.test(value),
  }
}
