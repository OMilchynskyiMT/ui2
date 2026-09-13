import type { Validator, ValidatorOptions } from '../types'
import { type ContextValue, resolveContextValue } from './context'

const euiPattern = /^([\dA-Fa-f]{2}[.:-]?){7}([\dA-Fa-f]{2})$/
const sensorIdPattern = /^([\dA-Fa-f]{2}-){7}([\dA-Fa-f]{2})$/
const keyPattern = /^([\dA-Fa-f]{2}[.:-]?){15}([\dA-Fa-f]{2})$/
const deviceAddressPattern = /^([\dA-Fa-f]{2}[.:-]?){3}([\dA-Fa-f]{2})$/
const address4Pattern = /^([\da-f]{2}:){3}([\da-f]{2})$/i
const rawEuiPattern = /^[\dA-Fa-f]{16}$/
const fragmentDescriptionPattern = /[\dA-Fa-f]{8}/
const deviceTextPattern = /^[^"';{}]*$/
const sessionTextPattern = /^[^';{}]*$/

const channelPlanBounds = [
  ['US915', 902_000_000, 928_000_000],
  ['AU915', 915_000_000, 928_000_000],
  ['EU868', 863_000_000, 870_000_000],
  ['AS923', 915_000_000, 928_000_000],
  ['KR920', 920_900_000, 923_300_000],
  ['IN865', 865_000_000, 867_000_000],
  ['RU864', 864_000_000, 870_000_000],
  ['ISM2400', 2_400_000_000, 2_500_000_000],
] as const

const findChannelPlanBounds = (channelPlan: string): readonly [number, number] | undefined => {
  const match = channelPlanBounds.find(([prefix]) => channelPlan.startsWith(prefix))
  return match ? [match[1], match[2]] : undefined
}

const formatFrequency = (value: number): string => (value / 1_000_000).toFixed(1)

type FrequencyUnit = 'hz' | 'mhz'

const toHertz = (value: number, unit: FrequencyUnit): number => (unit === 'mhz' ? value * 1_000_000 : value)

const clearHexSeparators = (value: string): string => value.replaceAll(/[ .:-]/g, '')

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

export const key = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.key',
    message: options?.message ?? 'Must be a 16-byte hexadecimal key',
    validate: value => keyPattern.test(value),
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

export const deviceText = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.deviceText',
    message: options?.message ?? 'Must not contain double quotes, single quotes, semicolons, or braces',
    validate: value => deviceTextPattern.test(value),
  }
}

export const sessionText = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.sessionText',
    message: options?.message ?? 'Must not contain single quotes, semicolons, or braces',
    validate: value => sessionTextPattern.test(value),
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

export const channelMaskLength = (channelPlan: string, options?: ValidatorOptions): Validator<string> => {
  const expectedLength = channelPlan.startsWith('US915') || channelPlan.startsWith('AU915') ? 20 : 4

  return {
    code: 'lora.channelMaskLength',
    message: options?.message ?? `Must contain exactly ${expectedLength} characters for the selected channel plan`,
    validate: value => value.length === expectedLength,
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

export const fragmentDescription = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.fragmentDescription',
    message: options?.message ?? 'Must contain a 4-byte hexadecimal fragment description',
    validate: value => fragmentDescriptionPattern.test(value),
  }
}

export const channelFrequency = (
  channelPlan: string,
  options?: ValidatorOptions & Readonly<{ unit?: FrequencyUnit }>
): Validator<number> => {
  const bounds = findChannelPlanBounds(channelPlan)
  const unit = options?.unit ?? 'hz'

  return {
    code: 'lora.channelFrequency',
    message:
      options?.message ??
      (bounds
        ? `Must be between ${formatFrequency(bounds[0])} and ${formatFrequency(bounds[1])} MHz`
        : 'Must be valid for the selected LoRa channel plan'),
    validate: value => {
      const frequency = toHertz(value, unit)
      return bounds !== undefined && frequency >= bounds[0] && frequency <= bounds[1]
    },
  }
}

const parseChannel = (value: string, expectedParts: number): number | undefined => {
  const parts = value.split(',')
  if (parts.length !== expectedParts) return undefined
  const frequency = Number.parseInt(parts[1] ?? '', 10)
  return Number.isNaN(frequency) ? undefined : frequency
}

export const uplinkChannel = (channelPlan: string, options?: ValidatorOptions): Validator<string> => {
  const bounds = findChannelPlanBounds(channelPlan)

  return {
    code: 'lora.uplinkChannel',
    message:
      options?.message ??
      ((value: string): string => {
        const frequency = parseChannel(value, 3)
        if (frequency === undefined) return 'Must use INDEX,FREQ,DR format'
        if (!bounds) return 'Frequency is not valid for the selected LoRa channel plan'
        return `Frequency must be 0 or between ${formatFrequency(bounds[0])} and ${formatFrequency(bounds[1])} MHz`
      }),
    validate: value => {
      const frequency = parseChannel(value, 3)
      if (frequency === undefined) return false
      if (frequency === 0) return true
      return bounds !== undefined && frequency >= bounds[0] && frequency <= bounds[1]
    },
  }
}

export const downlinkChannel = (channelPlan: string, options?: ValidatorOptions): Validator<string> => {
  const bounds = findChannelPlanBounds(channelPlan)

  return {
    code: 'lora.downlinkChannel',
    message:
      options?.message ??
      ((value: string): string => {
        const frequency = parseChannel(value, 2)
        if (frequency === undefined) return 'Must use INDEX,FREQ format'
        if (!bounds) return 'Frequency is not valid for the selected LoRa channel plan'
        return `Frequency must be 0 or between ${formatFrequency(bounds[0])} and ${formatFrequency(bounds[1])} MHz`
      }),
    validate: value => {
      const frequency = parseChannel(value, 2)
      if (frequency === undefined) return false
      if (frequency === 0) return true
      return bounds !== undefined && frequency >= bounds[0] && frequency <= bounds[1]
    },
  }
}

const packetForwarderConfigParse = (value: string): Readonly<Record<string, unknown>> | undefined => {
  try {
    const parsed: unknown = JSON.parse(value.replaceAll(/\/\*(\*(?!\/)|[^*])*\*\//g, ''))
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Readonly<Record<string, unknown>>)
      : undefined
  } catch {
    return undefined
  }
}

export const packetForwarderConfig = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'lora.packetForwarderConfig',
    message: options?.message ?? 'Must be a valid packet-forwarder JSON configuration',
    validate: value => {
      const config = packetForwarderConfigParse(value)
      if (!config?.gateway_conf) return false
      return ['radio_conf', 'SX1301_conf', 'SX130x_conf', 'SX1301_array_conf'].some(field =>
        Object.hasOwn(config, field)
      )
    },
  }
}
