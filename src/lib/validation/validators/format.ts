import type { Validator, ValidatorOptions } from '../types'

const base64Pattern = /^(?:[a-z0-9+/]{4})*(?:[a-z0-9+/]{3}=|[a-z0-9+/]{2}==)?$/i
const controlCharacterPattern = /[\u{0}-\u{1F}\u{7F}]+/u
const printableAsciiPattern = /^[\u{20}-\u{7F}]*$/u
const fileNamePattern = /^[^"*/:<>?\\]+$/
const urlPathPattern = /^\/[\w#%&+./:=?@~-]*$/
const digitalIoNamePattern = /^[\d A-Za-z]+$/
const digitsPattern = /^\d+$/
const alphanumericPattern = /^[\dA-Za-z]+$/
const hexDigitsPattern = /^[\dA-Fa-f]+$/
const lowercaseHexDigitsPattern = /^[\da-f]+$/
const namePattern = /^[\w .-]+$/
const ruleNamePattern = /^[A-Za-z][\w -]*$/
const countryCodePattern = /^[A-Za-z]{2}$/
const accountKeyPattern = /^\w{8}(?:-\w{4}){3}-\w{12}$/
const datePattern = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(\d{4})$/
const timePattern = /^(0?\d|1\d|2[0-3]):(0?\d|[1-5]\d):(0?\d|[1-5]\d)$/
const colorPattern = /^#([\dA-Fa-f]{6}|[\dA-Fa-f]{3})$/
const prefixPattern = /^[^$&|]+$/
const carrierNamePattern = /^[\w &.-]+$/
const sysnameDescriptionPattern = /^([^"`])+$/
const tunnelNamePattern = /^[A-Za-z][\w-]*$/
const uriPattern = /^(\w+):\/\/(.+)$/i
const x509OtherNamePattern = /^([\d.]+);(\w+):(.*)$/i
const hexPayloadPattern = /^(?:0x)?(?:[\da-f]{2})+$/i
const separatedHexDataPattern = /^[\da-f .:-]+$/i

export const asciiPrintable = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.asciiPrintable',
    message: options?.message ?? 'Must contain printable ASCII characters only',
    validate: value => printableAsciiPattern.test(value),
  }
}

export const base64Data = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.base64',
    message: options?.message ?? 'Must be valid Base64 data',
    validate: value => base64Pattern.test(value),
  }
}

export const noControlCharacters = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.noControlCharacters',
    message: options?.message ?? 'Must not contain control characters',
    validate: value => !controlCharacterPattern.test(value),
  }
}

export const noWhitespace = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.noWhitespace',
    message: options?.message ?? 'Must not contain whitespace characters',
    validate: value => !/\s/u.test(value),
  }
}

export const fileName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.fileName',
    message: options?.message ?? 'Must be a valid file name',
    validate: value => fileNamePattern.test(value),
  }
}

export const urlPath = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.urlPath',
    message: options?.message ?? 'Must be a valid URL path',
    validate: value => urlPathPattern.test(value),
  }
}

export const digitalIoName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.digitalIoName',
    message: options?.message ?? 'Must contain letters, digits, and spaces only',
    validate: value => digitalIoNamePattern.test(value),
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

export const name = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.name',
    message: options?.message ?? 'Must contain letters, digits, spaces, dots, underscores, or hyphens only',
    validate: value => namePattern.test(value.trim()),
  }
}

export const username = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.username',
    message: options?.message ?? 'Must be a valid username with at least 5 characters',
    validate: value => value.trim().length >= 5 && namePattern.test(value.trim()),
  }
}

export const ruleName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.ruleName',
    message:
      options?.message ?? 'Must start with a letter and contain letters, digits, spaces, underscores, or hyphens only',
    validate: value => ruleNamePattern.test(value.trim()),
  }
}

export const countryCode = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.countryCode',
    message: options?.message ?? 'Must be a two-letter country code',
    validate: value => countryCodePattern.test(value),
  }
}

export const accountKey = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.accountKey',
    message: options?.message ?? 'Must be a valid account key',
    validate: value => accountKeyPattern.test(value),
  }
}

export const date = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.date',
    message: options?.message ?? 'Must be a date in MM/DD/YYYY format',
    validate: value => datePattern.test(value),
  }
}

export const time = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.time',
    message: options?.message ?? 'Must be a 24-hour time in HH:MM:SS format',
    validate: value => timePattern.test(value),
  }
}

export const hexColor = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.hexColor',
    message: options?.message ?? 'Must be a 3- or 6-digit hexadecimal color',
    validate: value => colorPattern.test(value),
  }
}

export const prefix = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.prefix',
    message: options?.message ?? 'Must not contain $, &, or | characters',
    validate: value => prefixPattern.test(value),
  }
}

export const backoffTimings = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.backoffTimings',
    message: options?.message ?? 'Must be a comma-separated list of positive numbers',
    validate: value =>
      !value.split(',').some(part => {
        const timing = Number(part.trim())
        return Number.isNaN(timing) || timing <= 0
      }),
  }
}

export const carrierName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.carrierName',
    message: options?.message ?? 'Must contain letters, digits, spaces, &, dots, underscores, or hyphens only',
    validate: value => carrierNamePattern.test(value.trim()),
  }
}

export const systemNameDescription = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.systemNameDescription',
    message: options?.message ?? 'Must not contain double quotes or backticks',
    validate: value => sysnameDescriptionPattern.test(value.trim()),
  }
}

export const tunnelName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.tunnelName',
    message: options?.message ?? 'Must start with a letter and contain letters, digits, underscores, or hyphens only',
    validate: value => tunnelNamePattern.test(value),
  }
}

export const uri = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.uri',
    message: options?.message ?? 'Must be a URI containing a scheme and value',
    validate: value => uriPattern.test(value),
  }
}

export const x509OtherName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.x509OtherName',
    message: options?.message ?? 'Must use <oid>;<asn1-type>:<value> format',
    validate: value => x509OtherNamePattern.test(value),
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
