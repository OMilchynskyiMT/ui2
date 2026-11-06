import type { Validator, ValidatorOptions } from '../types'

const urlPathPattern = /^\/[\w#%&+./:=?@~-]*$/
const uriPattern = /^(\w+):\/\/(.+)$/i
const publicUrlPattern =
  /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4])|[\da-z\u{A1}-\u{FFFF}]+(?:-[\da-z\u{A1}-\u{FFFF}]+)*(?:\.[\da-z\u{A1}-\u{FFFF}]+(?:-[\da-z\u{A1}-\u{FFFF}]+)*)*\.[a-z\u{A1}-\u{FFFF}]{2,})(?::\d{2,5})?(?:\/\S*)?([^/])$/iu

export const urlPath = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.urlPath',
    message: options?.message ?? 'Must be a valid URL path',
    validate: value => urlPathPattern.test(value),
  }
}

export const uri = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.uri',
    message: options?.message ?? 'Must be a URI containing a scheme and value',
    validate: value => uriPattern.test(value),
  }
}

export const basicStationUri = (credentials: 'CUPS' | 'LNS', options?: ValidatorOptions): Validator<string> => {
  const protocols = credentials === 'CUPS' ? ['http://', 'https://'] : ['ws://', 'wss://']
  const expected = credentials === 'CUPS' ? 'http:// or https://' : 'ws:// or wss://'

  return {
    code: 'lora.basicStationUri',
    message: options?.message ?? `Must start with ${expected}`,
    validate: value => value.length > 0 && protocols.some(protocol => value.startsWith(protocol)),
  }
}

export const appUri = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.appUri',
    message: options?.message ?? 'Must start with mqtt://, mqtts://, http://, https://, or wss://',
    validate: value => /^(mqtt(s)?|http(s)?|wss):\/\//i.test(value),
  }
}

export const publicUrl = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.publicUrl',
    message: options?.message ?? 'Must be a valid public HTTP, HTTPS, or FTP URL',
    validate: value => publicUrlPattern.test(value),
  }
}
