import { describe, expect, it } from 'vitest'

import type { Validator } from '../../types'
import {
  address4,
  appUri,
  basicStationUri,
  channelFrequency,
  channelMaskLength,
  deviceAddress,
  deviceText,
  downlinkChannel,
  eui,
  euiRangeEnd,
  fragmentDescription,
  key,
  nonReservedDeviceAddress,
  nonZeroGatewayId,
  packetForwarderConfig,
  sensorId,
  sessionText,
  uplinkChannel,
} from '../../validators/lora'
import { getValidatorMessage, shouldValidate } from '../helpers'

type StringCase = Readonly<{
  name: string
  validator: Validator<string>
  code: string
  message: string
  valid: readonly string[]
  invalid: readonly string[]
}>

const stringCases: readonly StringCase[] = [
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
    name: 'key',
    validator: key(),
    code: 'lora.key',
    message: 'Must be a 16-byte hexadecimal key',
    valid: ['000102030405060708090A0B0C0D0E0F', '00-01-02-03-04-05-06-07-08-09-0A-0B-0C-0D-0E-0F'],
    invalid: ['000102030405060708090A0B0C0D0E', '00-01-02-03'],
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
  {
    name: 'deviceText',
    validator: deviceText(),
    code: 'lora.deviceText',
    message: 'Must not contain double quotes, single quotes, semicolons, or braces',
    valid: ['', 'device-01', 'Firmware 1.0'],
    invalid: ['bad"name', "bad'name", 'bad;name', 'bad{name'],
  },
  {
    name: 'sessionText',
    validator: sessionText(),
    code: 'lora.sessionText',
    message: 'Must not contain single quotes, semicolons, or braces',
    valid: ['device-name', 'double"quote'],
    invalid: ["single'quote", 'bad;value', 'bad{value}'],
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
    name: 'fragmentDescription',
    validator: fragmentDescription(),
    code: 'lora.fragmentDescription',
    message: 'Must contain a 4-byte hexadecimal fragment description',
    valid: ['12345678', 'prefix12345678suffix'],
    invalid: ['1234567', '1234567G'],
  },
]

describe.each(stringCases)('$name', ({ validator, code, message, valid, invalid }) => {
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

describe('channelMaskLength', () => {
  it('uses 20 characters for US915 and AU915', () => {
    const validator = channelMaskLength('US915')
    expect(validator.code).toBe('lora.channelMaskLength')
    expect(validator.message).toBe('Must contain exactly 20 characters for the selected channel plan')
    expect(shouldValidate(validator, '0123456789abcdefABCD')).toBe(true)
    expect(shouldValidate(validator, '0123')).toBe(false)
  })

  it('uses 4 characters for other legacy plans without duplicating hexadecimal validation', () => {
    const validator = channelMaskLength('EU868')
    expect(validator.message).toBe('Must contain exactly 4 characters for the selected channel plan')
    expect(shouldValidate(validator, '00ff')).toBe(true)
    expect(shouldValidate(validator, 'zzzz')).toBe(true)
    expect(shouldValidate(validator, '00000')).toBe(false)
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

describe('channelFrequency', () => {
  it('validates Hz values against the selected legacy plan', () => {
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

  it('preserves the legacy INDEX,FREQ,DR representation', () => {
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

  it('preserves the legacy INDEX,FREQ representation', () => {
    expect(validator.code).toBe('lora.downlinkChannel')
    expect(shouldValidate(validator, '3,867700000')).toBe(true)
    expect(shouldValidate(validator, '3,0')).toBe(true)
    expect(shouldValidate(validator, '3,900000000')).toBe(false)
    expect(shouldValidate(validator, '3,867700000,50')).toBe(false)
    expect(getValidatorMessage(validator, '3,867700000,50')).toBe('Must use INDEX,FREQ format')
  })
})

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
