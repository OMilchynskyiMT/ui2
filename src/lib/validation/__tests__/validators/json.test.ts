import { describe, expect, it } from 'vitest'

import { packetForwarderConfig } from '../../validators/json'
import { shouldValidate } from '../helpers'

describe('packetForwarderConfig', () => {
  const validator = packetForwarderConfig()

  it('accepts JSON with gateway and at least one radio configuration', () => {
    expect(validator.code).toBe('lora.packetForwarderConfig')
    expect(validator.message).toBe('Must be a valid packet-forwarder JSON configuration')
    expect(shouldValidate(validator, '{"gateway_conf":{},"SX1301_conf":{}}')).toBe(true)
    expect(shouldValidate(validator, '/* comment */ {"gateway_conf":{},"radio_conf":{}}')).toBe(true)
  })

  it('rejects malformed or incomplete configurations', () => {
    expect(shouldValidate(validator, '{')).toBe(false)
    expect(shouldValidate(validator, '{"gateway_conf":{}}')).toBe(false)
    expect(shouldValidate(validator, '{"gateway_conf":null,"radio_conf":{}}')).toBe(false)
    expect(shouldValidate(validator, '{"radio_conf":{}}')).toBe(false)
  })
})
