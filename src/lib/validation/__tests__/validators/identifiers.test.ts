import { describe, expect, it } from 'vitest'

import type { Validator } from '../../types'
import {
  accountKey,
  address4,
  countryCode,
  deviceAddress,
  engineId,
  eui,
  euiRangeEnd,
  nonReservedDeviceAddress,
  nonZeroGatewayId,
  sensorId,
  simIccid,
} from '../../validators/identifiers'
import { getValidatorMessage, shouldValidate } from '../helpers'

type StringCase = Readonly<{
  name: string
  validator: Validator<string>
  code: string
  message: string
  valid: readonly string[]
  invalid: readonly string[]
}>

type MetadataCase = readonly [name: string, validator: Validator<string>, code: string, message: string]

const cases: readonly StringCase[] = [
  {
    name: 'countryCode',
    validator: countryCode(),
    code: 'format.countryCode',
    message: 'Must be a two-letter country code',
    valid: ['US', 'ua'],
    invalid: ['U', 'USA', '12'],
  },
  {
    name: 'accountKey',
    validator: accountKey(),
    code: 'format.accountKey',
    message: 'Must be a valid account key',
    valid: ['12345678-1234-abcd-5678-123456789012'],
    invalid: ['12345678-1234-abcd-5678-12345678901', 'not-a-key'],
  },
  {
    name: 'eui',
    validator: eui(),
    code: 'lora.eui',
    message: 'Must be an 8-byte EUI value',
    valid: ['0001020304050607', '00-01-02-03-04-05-06-07', '00:01:02:03:04:05:06:07'],
    invalid: ['00010203040506', '00-01-02-03-04-05-06-GG'],
  },
  {
    name: 'sensorId',
    validator: sensorId(),
    code: 'lora.sensorId',
    message: 'Must be an 8-byte hyphen-separated sensor ID',
    valid: ['00-01-02-03-04-05-06-07'],
    invalid: ['0001020304050607', '00:01:02:03:04:05:06:07'],
  },
  {
    name: 'deviceAddress',
    validator: deviceAddress(),
    code: 'lora.deviceAddress',
    message: 'Must be a 4-byte LoRa device address',
    valid: ['01020304', '01:02:03:04', '01-02-03-04'],
    invalid: ['010203', '01:02:03:GG'],
  },
  {
    name: 'address4',
    validator: address4(),
    code: 'lora.address4',
    message: 'Must be a 4-byte colon-separated hexadecimal address',
    valid: ['01:02:03:04', 'aa:BB:cc:DD'],
    invalid: ['01020304', '01-02-03-04'],
  },
]

const metadataCases: readonly MetadataCase[] = [
  ['engineId', engineId(), 'security.engineId', 'Must be a hexadecimal engine ID between 5 and 32 octets'],
]

describe('simIccid', () => {
  const validator = simIccid()

  it('uses stable metadata', () => {
    expect(validator.code).toBe('cellular.simIccid')
    expect(getValidatorMessage(validator, 'ANY')).toBe('Must be ANY or a 19- or 20-digit ICCID beginning with 89')
  })

  it.each(['ANY', '8912345678901234567', '89123456789012345678'])('accepts %j', value => {
    expect(shouldValidate(validator, value)).toBe(true)
  })

  it.each(['8812345678901234567', '891234567890123456', '891234567890123456789'])('rejects %j', value => {
    expect(shouldValidate(validator, value)).toBe(false)
  })
})

describe.each(cases)('$name', ({ validator, code, message, valid, invalid }) => {
  it('uses stable metadata', () => {
    expect(validator.code).toBe(code)
    expect(getValidatorMessage(validator, valid[0] ?? '')).toBe(message)
  })

  it.each(valid)('accepts %j', value => {
    expect(shouldValidate(validator, value)).toBe(true)
  })

  it.each(invalid)('rejects %j', value => {
    expect(shouldValidate(validator, value)).toBe(false)
  })
})

describe('nonReservedDeviceAddress', () => {
  const validator = nonReservedDeviceAddress()

  it('checks only the reserved-value restriction', () => {
    expect(validator.code).toBe('lora.nonReservedDeviceAddress')
    expect(shouldValidate(validator, '01020304')).toBe(true)
    expect(shouldValidate(validator, '01:02:03:04')).toBe(true)
    expect(shouldValidate(validator, '00000000')).toBe(false)
    expect(shouldValidate(validator, 'ff:ff:ff:ff')).toBe(false)
    expect(shouldValidate(validator, 'invalid')).toBe(true)
  })
})

describe('nonZeroGatewayId', () => {
  const validator = nonZeroGatewayId()

  it('checks only the all-zero gateway restriction', () => {
    expect(validator.code).toBe('lora.nonZeroGatewayId')
    expect(shouldValidate(validator, '0000000000000001')).toBe(true)
    expect(shouldValidate(validator, '0000000000000000')).toBe(false)
    expect(shouldValidate(validator, 'invalid')).toBe(true)
  })
})

describe('euiRangeEnd', () => {
  const validator = euiRangeEnd('FFFFFFFFFFFFFFF0')

  it('compares the full 64-bit values without Number precision loss', () => {
    expect(validator.code).toBe('lora.euiRangeEnd')
    expect(validator.message).toBe('Must not be lower than the range start EUI')
    expect(shouldValidate(validator, 'FFFFFFFFFFFFFFF0')).toBe(true)
    expect(shouldValidate(validator, 'FFFFFFFFFFFFFFFF')).toBe(true)
    expect(shouldValidate(validator, 'FFFFFFFFFFFFFFEF')).toBe(false)
    expect(shouldValidate(validator, 'invalid')).toBe(true)
  })
})

describe.each(metadataCases)('%s metadata', (_name, validator, code, message) => {
  it('uses a stable code and default message', () => {
    expect(validator.code).toBe(code)
    expect(validator.message).toBe(message)
  })
})

describe('engineId', () => {
  const validator = engineId()

  it.each(['0x0102030405', `0X${'ab'.repeat(32)}`])('accepts %j', value => {
    expect(shouldValidate(validator, value)).toBe(true)
  })

  it.each(['0102030405', '0x01020304', `0x${'ab'.repeat(33)}`])('rejects %j', value => {
    expect(shouldValidate(validator, value)).toBe(false)
  })
})
