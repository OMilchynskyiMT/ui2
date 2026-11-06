import { describe, expect, it } from 'vitest'

import { channelFrequency, channelMaskLength, downlinkChannel, uplinkChannel } from '../../validators/channels'
import { getValidatorMessage, shouldValidate } from '../helpers'

describe('channelMaskLength', () => {
  it('uses 20 characters for US915 and AU915', () => {
    const validator = channelMaskLength('US915')
    expect(validator.code).toBe('lora.channelMaskLength')
    expect(validator.message).toBe('Must contain exactly 20 characters for the selected channel plan')
    expect(shouldValidate(validator, '0123456789abcdefABCD')).toBe(true)
    expect(shouldValidate(validator, '0123')).toBe(false)
  })

  it('uses 4 characters for other plans without duplicating hexadecimal validation', () => {
    const validator = channelMaskLength('EU868')
    expect(validator.message).toBe('Must contain exactly 4 characters for the selected channel plan')
    expect(shouldValidate(validator, '00ff')).toBe(true)
    expect(shouldValidate(validator, 'zzzz')).toBe(true)
    expect(shouldValidate(validator, '00000')).toBe(false)
  })
})

describe('channelFrequency', () => {
  it('validates Hz values against the selected plan', () => {
    const validator = channelFrequency('KR920')
    expect(validator.code).toBe('lora.channelFrequency')
    expect(validator.message).toBe('Must be between 920.9 and 923.3 MHz')
    expect(shouldValidate(validator, 920_900_000)).toBe(true)
    expect(shouldValidate(validator, 923_300_000)).toBe(true)
    expect(shouldValidate(validator, 920_899_999)).toBe(false)
  })

  it('supports MHz values used by LoRa profile forms', () => {
    const validator = channelFrequency('EU868', { unit: 'mhz' })
    expect(shouldValidate(validator, 863)).toBe(true)
    expect(shouldValidate(validator, 870)).toBe(true)
    expect(shouldValidate(validator, 870.1)).toBe(false)
  })

  it('rejects an unknown channel plan', () => {
    const validator = channelFrequency('UNKNOWN')
    expect(validator.message).toBe('Must be valid for the selected LoRa channel plan')
    expect(shouldValidate(validator, 868_000_000)).toBe(false)
  })
})

describe('uplinkChannel', () => {
  const validator = uplinkChannel('EU868')

  it('preserves the INDEX,FREQ,DR representation', () => {
    expect(validator.code).toBe('lora.uplinkChannel')
    expect(shouldValidate(validator, '3,867700000,50')).toBe(true)
    expect(shouldValidate(validator, '3,0,50')).toBe(true)
    expect(shouldValidate(validator, '3,900000000,50')).toBe(false)
    expect(shouldValidate(validator, '3,867700000')).toBe(false)
    expect(getValidatorMessage(validator, '3,867700000')).toBe('Must use INDEX,FREQ,DR format')
  })
})

describe('downlinkChannel', () => {
  const validator = downlinkChannel('EU868')

  it('preserves the INDEX,FREQ representation', () => {
    expect(validator.code).toBe('lora.downlinkChannel')
    expect(shouldValidate(validator, '3,867700000')).toBe(true)
    expect(shouldValidate(validator, '3,0')).toBe(true)
    expect(shouldValidate(validator, '3,900000000')).toBe(false)
    expect(shouldValidate(validator, '3,867700000,50')).toBe(false)
    expect(getValidatorMessage(validator, '3,867700000,50')).toBe('Must use INDEX,FREQ format')
  })
})
