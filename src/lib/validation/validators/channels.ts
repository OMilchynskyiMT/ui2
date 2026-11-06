import type { Validator, ValidatorOptions } from '../types'

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

const parseChannel = (value: string, expectedParts: number): number | undefined => {
  const parts = value.split(',')
  if (parts.length !== expectedParts) return undefined
  const frequency = Number.parseInt(parts[1] ?? '', 10)
  return Number.isNaN(frequency) ? undefined : frequency
}

export const channelMaskLength = (channelPlan: string, options?: ValidatorOptions): Validator<string> => {
  const expectedLength = channelPlan.startsWith('US915') || channelPlan.startsWith('AU915') ? 20 : 4

  return {
    code: 'lora.channelMaskLength',
    message: options?.message ?? `Must contain exactly ${expectedLength} characters for the selected channel plan`,
    validate: value => value.length === expectedLength,
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
