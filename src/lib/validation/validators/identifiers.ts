import type { Validator, ValidatorOptions } from '../types'
import { type ContextValue, resolveContextValue } from './context'
import { digits } from './data'
import { inRange as stringInRange, startsWith } from './string'
const countryCodePattern = /^[A-Za-z]{2}$/
const accountKeyPattern = /^\w{8}(?:-\w{4}){3}-\w{12}$/
const engineIdPattern = /(0x|0X)([\dA-Fa-f]{2}){5,32}$/
const iccidDigits = digits()
const iccidLength = stringInRange(19, 20)
const iccidPrefix = startsWith('89')
const euiPattern = /^([\dA-Fa-f]{2}[.:-]?){7}([\dA-Fa-f]{2})$/
const sensorIdPattern = /^([\dA-Fa-f]{2}-){7}([\dA-Fa-f]{2})$/
const deviceAddressPattern = /^([\dA-Fa-f]{2}[.:-]?){3}([\dA-Fa-f]{2})$/
const address4Pattern = /^([\da-f]{2}:){3}([\da-f]{2})$/i
const rawEuiPattern = /^[\dA-Fa-f]{16}$/

const clearHexSeparators = (value: string): string => value.replaceAll(/[ .:-]/g, '')

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

export const engineId = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'security.engineId',
    message: options?.message ?? 'Must be a hexadecimal engine ID between 5 and 32 octets',
    validate: value => engineIdPattern.test(value),
  }
}

export const simIccid = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'cellular.simIccid',
    message: options?.message ?? 'Must be ANY or a 19- or 20-digit ICCID beginning with 89',
    validate: (value, context) =>
      value === 'ANY' ||
      (iccidPrefix.validate(value, context) &&
        iccidLength.validate(value, context) &&
        iccidDigits.validate(value, context)),
  }
}

export const eui = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.eui',
    message: options?.message ?? 'Must be an 8-byte EUI value',
    validate: value => euiPattern.test(value),
  }
}

export const sensorId = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.sensorId',
    message: options?.message ?? 'Must be an 8-byte hyphen-separated sensor ID',
    validate: value => sensorIdPattern.test(value),
  }
}

export const deviceAddress = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.deviceAddress',
    message: options?.message ?? 'Must be a 4-byte LoRa device address',
    validate: value => deviceAddressPattern.test(value),
  }
}

export const nonReservedDeviceAddress = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.nonReservedDeviceAddress',
    message: options?.message ?? 'Must not be 00000000 or FFFFFFFF',
    validate: value => {
      const normalized = clearHexSeparators(value).toLowerCase()
      return normalized !== '00000000' && normalized !== 'ffffffff'
    },
  }
}

export const address4 = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.address4',
    message: options?.message ?? 'Must be a 4-byte colon-separated hexadecimal address',
    validate: value => address4Pattern.test(value),
  }
}

export const nonZeroGatewayId = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.nonZeroGatewayId',
    message: options?.message ?? 'Must not be an all-zero gateway ID',
    validate: value => value.toLowerCase() !== '0000000000000000',
  }
}

export const euiRangeEnd = (start: ContextValue<string>, options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.euiRangeEnd',
    message: options?.message ?? 'Must not be lower than the range start EUI',
    validate: (value, context) => {
      const startValue = resolveContextValue(start, context)
      if (!rawEuiPattern.test(startValue) || !rawEuiPattern.test(value)) return true
      return BigInt(`0x${value}`) >= BigInt(`0x${startValue}`)
    },
  }
}
