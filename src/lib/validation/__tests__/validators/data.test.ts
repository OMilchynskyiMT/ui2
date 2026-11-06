import { describe, expect, it } from 'vitest'

import type { Validator } from '../../types'
import {
  alphanumeric,
  base64Data,
  digits,
  fragmentDescription,
  hexBytes,
  hexDigits,
  hexPayload,
  lowercaseHexDigits,
  separatedHexData,
  uplinkPayload,
} from '../../validators/data'
import { getValidatorMessage, shouldValidate } from '../helpers'

type StringCase = Readonly<{
  name: string
  validator: Validator<string>
  code: string
  message: string
  valid: readonly string[]
  invalid: readonly string[]
}>

const cases: readonly StringCase[] = [
  {
    name: 'base64Data',
    validator: base64Data(),
    code: 'format.base64',
    message: 'Must be valid Base64 data',
    valid: ['', 'SGVsbG8=', 'YWJjZA=='],
    invalid: ['abc', 'SGVsbG8===', 'hello world'],
  },
  {
    name: 'digits',
    validator: digits(),
    code: 'format.digits',
    message: 'Must contain digits only',
    valid: ['0', '123456'],
    invalid: ['12.3', '-1', '12a'],
  },
  {
    name: 'alphanumeric',
    validator: alphanumeric(),
    code: 'format.alphanumeric',
    message: 'Must contain letters and digits only',
    valid: ['0', 'abc123XYZ'],
    invalid: ['abc-123', 'abc_123'],
  },
  {
    name: 'hexDigits',
    validator: hexDigits(),
    code: 'format.hexDigits',
    message: 'Must contain hexadecimal digits only',
    valid: ['0', 'deadBEEF'],
    invalid: ['0x12', 'xyz'],
  },
  {
    name: 'lowercaseHexDigits',
    validator: lowercaseHexDigits(),
    code: 'format.lowercaseHexDigits',
    message: 'Must contain lowercase hexadecimal digits only',
    valid: ['0', 'deadbeef0123456789'],
    invalid: ['DEADBEEF', '0x12', 'xyz'],
  },
  {
    name: 'hexPayload',
    validator: hexPayload(),
    code: 'format.hexPayload',
    message: 'Must contain a whole number of hexadecimal bytes',
    valid: ['00', 'AABB', '0xdeadBEEF'],
    invalid: ['0xabc', 'AA:BB', 'xyz'],
  },
  {
    name: 'separatedHexData',
    validator: separatedHexData(),
    code: 'format.separatedHexData',
    message: 'Must contain an even number of hexadecimal digits with optional separators',
    valid: ['', 'A:B', 'AA:BB', 'aa bb cc dd', 'AA.BB-CC:DD'],
    invalid: ['abc', 'AA/GG'],
  },
  {
    name: 'fragmentDescription',
    validator: fragmentDescription(),
    code: 'lora.fragmentDescription',
    message: 'Must contain a 4-byte hexadecimal fragment description',
    valid: ['12345678', 'prefix12345678suffix'],
    invalid: ['1234567', '1234567G'],
  },
]

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

describe('hexBytes', () => {
  it('validates the requested byte length with an optional 0x prefix', () => {
    const validator = hexBytes(4)
    expect(validator.code).toBe('format.hexBytes')
    expect(getValidatorMessage(validator, '00112233')).toBe('Must contain exactly 4 bytes in hexadecimal')
    expect(shouldValidate(validator, '00112233')).toBe(true)
    expect(shouldValidate(validator, '0x00112233')).toBe(true)
    expect(shouldValidate(validator, '001122')).toBe(false)
  })

  it('can reject a 0x prefix', () => {
    expect(shouldValidate(hexBytes(2, { allowPrefix: false }), 'aabb')).toBe(true)
    expect(shouldValidate(hexBytes(2, { allowPrefix: false }), '0xaabb')).toBe(false)
  })

  it('rejects invalid byte lengths', () => {
    expect(() => hexBytes(0)).toThrow(RangeError)
    expect(() => hexBytes(1.5)).toThrow(RangeError)
  })
})

describe('uplinkPayload', () => {
  const validator = uplinkPayload()

  it('accepts hexadecimal and Base64 payload formats', () => {
    expect(validator.code).toBe('scada.uplinkPayload')
    expect(validator.message).toBe('Must contain hexadecimal or Base64 payload data')
    expect(shouldValidate(validator, 'AABBCC')).toBe(true)
    expect(shouldValidate(validator, 'SGVsbG8=')).toBe(true)
    expect(shouldValidate(validator, '')).toBe(false)
    expect(shouldValidate(validator, 'not payload!')).toBe(false)
  })
})
