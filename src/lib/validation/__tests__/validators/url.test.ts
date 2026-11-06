import { describe, expect, it } from 'vitest'

import type { Validator } from '../../types'
import { appUri, basicStationUri, publicUrl, uri, urlPath } from '../../validators/url'
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
    name: 'urlPath',
    validator: urlPath(),
    code: 'format.urlPath',
    message: 'Must be a valid URL path',
    valid: ['/', '/api/v1?a=b', '/path#fragment'],
    invalid: ['api/v1', '/path with spaces'],
  },
  {
    name: 'uri',
    validator: uri(),
    code: 'format.uri',
    message: 'Must be a URI containing a scheme and value',
    valid: ['https://example.com', 'custom://value'],
    invalid: ['https://', 'example.com'],
  },
  {
    name: 'appUri',
    validator: appUri(),
    code: 'lora.appUri',
    message: 'Must start with mqtt://, mqtts://, http://, https://, or wss://',
    valid: ['mqtt://broker', 'MQTTS://broker', 'http://host', 'https://host', 'wss://host'],
    invalid: ['ws://host', 'ftp://host', 'host'],
  },
  {
    name: 'publicUrl',
    validator: publicUrl(),
    code: 'network.publicUrl',
    message: 'Must be a valid public HTTP, HTTPS, or FTP URL',
    valid: ['https://example.com/path', 'ftp://example.com/file'],
    invalid: ['http://192.168.1.1/path', 'https://localhost/path', 'example.com'],
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

describe('basicStationUri', () => {
  it('validates CUPS URI schemes', () => {
    const validator = basicStationUri('CUPS')
    expect(validator.code).toBe('lora.basicStationUri')
    expect(validator.message).toBe('Must start with http:// or https://')
    expect(shouldValidate(validator, 'http://gateway')).toBe(true)
    expect(shouldValidate(validator, 'https://gateway')).toBe(true)
    expect(shouldValidate(validator, 'ws://gateway')).toBe(false)
  })

  it('validates LNS URI schemes', () => {
    const validator = basicStationUri('LNS')
    expect(validator.message).toBe('Must start with ws:// or wss://')
    expect(shouldValidate(validator, 'ws://gateway')).toBe(true)
    expect(shouldValidate(validator, 'wss://gateway')).toBe(true)
    expect(shouldValidate(validator, 'https://gateway')).toBe(false)
  })
})
