import type { Validator, ValidatorOptions } from '../types'

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
