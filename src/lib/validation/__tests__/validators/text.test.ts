import { describe, expect, it } from 'vitest'

import type { Validator } from '../../types'
import {
  asciiPrintable,
  carrierName,
  deviceText,
  digitalIoName,
  email,
  fileName,
  hexColor,
  ipsecId,
  name,
  noControlCharacters,
  noWhitespace,
  phoneNumber,
  prefix,
  propertyName,
  ruleName,
  sessionText,
  systemNameDescription,
  tunnelName,
  username,
} from '../../validators/text'
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
    name: 'asciiPrintable',
    validator: asciiPrintable(),
    code: 'format.asciiPrintable',
    message: 'Must contain printable ASCII characters only',
    valid: ['Hello 123!', '\u{7F}'],
    invalid: ['hello\nworld', 'é'],
  },
  {
    name: 'noControlCharacters',
    validator: noControlCharacters(),
    code: 'format.noControlCharacters',
    message: 'Must not contain control characters',
    valid: ['hello', 'пароль'],
    invalid: ['hello\n', `hello${String.fromCodePoint(0x7f)}`],
  },
  {
    name: 'noWhitespace',
    validator: noWhitespace(),
    code: 'format.noWhitespace',
    message: 'Must not contain whitespace characters',
    valid: ['password', 'a-b_c'],
    invalid: ['two words', 'tab\tvalue'],
  },
  {
    name: 'fileName',
    validator: fileName(),
    code: 'format.fileName',
    message: 'Must be a valid file name',
    valid: ['config.json', 'file name.txt'],
    invalid: ['path/file', 'bad:name', 'bad"name'],
  },
  {
    name: 'digitalIoName',
    validator: digitalIoName(),
    code: 'format.digitalIoName',
    message: 'Must contain letters, digits, and spaces only',
    valid: ['Input 1', 'ABC123'],
    invalid: ['Input-1', 'Input_1'],
  },
  {
    name: 'name',
    validator: name(),
    code: 'format.name',
    message: 'Must contain letters, digits, spaces, dots, underscores, or hyphens only',
    valid: ['John Doe', ' device_1 '],
    invalid: ['name@host', 'a/b'],
  },
  {
    name: 'username',
    validator: username(),
    code: 'format.username',
    message: 'Must be a valid username with at least 5 characters',
    valid: ['admin', ' user-name '],
    invalid: ['user', 'bad@name'],
  },
  {
    name: 'ruleName',
    validator: ruleName(),
    code: 'format.ruleName',
    message: 'Must start with a letter and contain letters, digits, spaces, underscores, or hyphens only',
    valid: ['Rule 1', 'rule_name'],
    invalid: ['1st rule', 'rule.name'],
  },
  {
    name: 'hexColor',
    validator: hexColor(),
    code: 'format.hexColor',
    message: 'Must be a 3- or 6-digit hexadecimal color',
    valid: ['#fff', '#0071BC'],
    invalid: ['fff', '#ffff', '#ggg'],
  },
  {
    name: 'prefix',
    validator: prefix(),
    code: 'format.prefix',
    message: 'Must not contain $, &, or | characters',
    valid: ['device-prefix', 'abc def'],
    invalid: ['a$b', 'a&b', 'a|b'],
  },
  {
    name: 'carrierName',
    validator: carrierName(),
    code: 'format.carrierName',
    message: 'Must contain letters, digits, spaces, &, dots, underscores, or hyphens only',
    valid: ['Carrier 1', 'ACME & Co.'],
    invalid: ['Carrier/1', 'Carrier@1'],
  },
  {
    name: 'systemNameDescription',
    validator: systemNameDescription(),
    code: 'format.systemNameDescription',
    message: 'Must not contain double quotes or backticks',
    valid: ['router-1', "single'quote"],
    invalid: ['bad"value', 'bad`value'],
  },
  {
    name: 'tunnelName',
    validator: tunnelName(),
    code: 'format.tunnelName',
    message: 'Must start with a letter and contain letters, digits, underscores, or hyphens only',
    valid: ['tun0', 'Gre_1'],
    invalid: ['1tun', 'tun name', 'tun.0'],
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
    name: 'phoneNumber',
    validator: phoneNumber(),
    code: 'network.phoneNumber',
    message: 'Must be a valid phone number',
    valid: ['+1 800 555-0100', '+(1) 800 555-0100', '380501234567'],
    invalid: ['phone', '+abc'],
  },
]

const metadataCases: readonly MetadataCase[] = [
  ['ipsecId', ipsecId(), 'security.ipsecId', 'Must not contain double quotes or a space-colon-space sequence'],
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

describe('propertyName', () => {
  const validator = propertyName()

  it('uses stable metadata', () => {
    expect(validator.code).toBe('scada.propertyName')
    expect(validator.message).toBe('Must contain letters, digits, underscores, or hyphens only')
  })

  it.each(['temperature', 'property_1', 'property-1', 'a'.repeat(129)])('accepts %j', value => {
    expect(shouldValidate(validator, value)).toBe(true)
  })

  it.each(['', 'property name', 'property.name', 'property@name'])('rejects %j', value => {
    expect(shouldValidate(validator, value)).toBe(false)
  })
})

describe.each(metadataCases)('%s metadata', (_name, validator, code, message) => {
  it('uses a stable code and default message', () => {
    expect(validator.code).toBe(code)
    expect(validator.message).toBe(message)
  })
})

describe('ipsecId', () => {
  const validator = ipsecId()

  it('preserves the two forbidden sequences', () => {
    expect(shouldValidate(validator, '')).toBe(true)
    expect(shouldValidate(validator, 'peer@example')).toBe(true)
    expect(shouldValidate(validator, 'bad"id')).toBe(false)
    expect(shouldValidate(validator, 'left : right')).toBe(false)
  })
})

describe('email', () => {
  const validator = email()

  it('uses stable metadata', () => {
    expect(validator.code).toBe('string.email')
    expect(validator.message).toBe('Invalid email address')
  })

  it.each(['user@example.com', 'john.doet@example.com.us', 'user-name@example.io'])('accepts %j', value => {
    expect(shouldValidate(validator, value)).toBe(true)
  })

  it.each(['user', 'user@localhost', '@example.com', 'user @example.com'])('rejects %j', value => {
    expect(shouldValidate(validator, value)).toBe(false)
  })
})
