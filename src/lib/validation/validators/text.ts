import type { Validator, ValidatorOptions } from '../types'
const controlCharacterPattern = /[\u{0}-\u{1F}\u{7F}]+/u
const printableAsciiPattern = /^[\u{20}-\u{7F}]*$/u
const fileNamePattern = /^[^"*/:<>?\\]+$/
const digitalIoNamePattern = /^[\d A-Za-z]+$/
const namePattern = /^[\w .-]+$/
const ruleNamePattern = /^[A-Za-z][\w -]*$/
const colorPattern = /^#([\dA-Fa-f]{6}|[\dA-Fa-f]{3})$/
const prefixPattern = /^[^$&|]+$/
const carrierNamePattern = /^[\w &.-]+$/
const sysnameDescriptionPattern = /^([^"`])+$/
const tunnelNamePattern = /^[A-Za-z][\w-]*$/
const emailPattern =
  /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(\.+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/
const propertyNamePattern = /^[\w-]+$/
const deviceTextPattern = /^[^"';{}]*$/
const sessionTextPattern = /^[^';{}]*$/
const phoneNumberPattern = /^\+*\({0,1}\d{1,3}\){0,1}[\d\s./-]*$/

export const asciiPrintable = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.asciiPrintable',
    message: options?.message ?? 'Must contain printable ASCII characters only',
    validate: value => printableAsciiPattern.test(value),
  }
}

export const carrierName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.carrierName',
    message: options?.message ?? 'Must contain letters, digits, spaces, &, dots, underscores, or hyphens only',
    validate: value => carrierNamePattern.test(value.trim()),
  }
}

export const deviceText = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.deviceText',
    message: options?.message ?? 'Must not contain double quotes, single quotes, semicolons, or braces',
    validate: value => deviceTextPattern.test(value),
  }
}

export const digitalIoName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.digitalIoName',
    message: options?.message ?? 'Must contain letters, digits, and spaces only',
    validate: value => digitalIoNamePattern.test(value),
  }
}

export const email = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'string.email',
    message: options?.message ?? 'Invalid email address',
    validate: value => emailPattern.test(value),
  }
}

export const fileName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.fileName',
    message: options?.message ?? 'Must be a valid file name',
    validate: value => fileNamePattern.test(value),
  }
}

export const hexColor = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.hexColor',
    message: options?.message ?? 'Must be a 3- or 6-digit hexadecimal color',
    validate: value => colorPattern.test(value),
  }
}

export const ipsecId = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.ipsecId',
    message: options?.message ?? 'Must not contain double quotes or a space-colon-space sequence',
    validate: value => !value.includes('"') && !value.includes(' : '),
  }
}

export const name = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.name',
    message: options?.message ?? 'Must contain letters, digits, spaces, dots, underscores, or hyphens only',
    validate: value => namePattern.test(value.trim()),
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

export const phoneNumber = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.phoneNumber',
    message: options?.message ?? 'Must be a valid phone number',
    validate: value => phoneNumberPattern.test(value),
  }
}

export const prefix = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.prefix',
    message: options?.message ?? 'Must not contain $, &, or | characters',
    validate: value => prefixPattern.test(value),
  }
}

export const propertyName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'scada.propertyName',
    message: options?.message ?? 'Must contain letters, digits, underscores, or hyphens only',
    validate: value => propertyNamePattern.test(value),
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

export const sessionText = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.sessionText',
    message: options?.message ?? 'Must not contain single quotes, semicolons, or braces',
    validate: value => sessionTextPattern.test(value),
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

export const username = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.username',
    message: options?.message ?? 'Must be a valid username with at least 5 characters',
    validate: value => value.trim().length >= 5 && namePattern.test(value.trim()),
  }
}
