import { describe, expect, it } from 'vitest'

import type { Validator } from '../../types'
import {
  accountKey,
  alphanumeric,
  asciiPrintable,
  backoffTimings,
  base64Data,
  carrierName,
  countryCode,
  date,
  digitalIoName,
  digits,
  fileName,
  hexBytes,
  hexColor,
  hexDigits,
  hexPayload,
  lowercaseHexDigits,
  name,
  noControlCharacters,
  noWhitespace,
  prefix,
  ruleName,
  separatedHexData,
  systemNameDescription,
  time,
  tunnelName,
  uri,
  urlPath,
  username,
  x509OtherName,
} from '../../validators/format'
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
    name: 'asciiPrintable',
    validator: asciiPrintable(),
    code: 'format.asciiPrintable',
    message: 'Must contain printable ASCII characters only',
    valid: ['Hello 123!', '\u{7F}'],
    invalid: ['hello\nworld', 'é'],
  },
  {
    name: 'base64Data',
    validator: base64Data(),
    code: 'format.base64',
    message: 'Must be valid Base64 data',
    valid: ['', 'SGVsbG8=', 'YWJjZA=='],
    invalid: ['abc', 'SGVsbG8===', 'hello world'],
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
    name: 'urlPath',
    validator: urlPath(),
    code: 'format.urlPath',
    message: 'Must be a valid URL path',
    valid: ['/', '/api/v1?a=b', '/path#fragment'],
    invalid: ['api/v1', '/path with spaces'],
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
    name: 'date',
    validator: date(),
    code: 'format.date',
    message: 'Must be a date in MM/DD/YYYY format',
    valid: ['1/1/2026', '12/31/2026'],
    invalid: ['2026-01-01', '13/01/2026'],
  },
  {
    name: 'time',
    validator: time(),
    code: 'format.time',
    message: 'Must be a 24-hour time in HH:MM:SS format',
    valid: ['0:0:0', '23:59:59'],
    invalid: ['24:00:00', '12:30'],
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
    name: 'backoffTimings',
    validator: backoffTimings(),
    code: 'format.backoffTimings',
    message: 'Must be a comma-separated list of positive numbers',
    valid: ['1', '1, 2, 2.5'],
    invalid: ['0', '1,-2', '1,nope'],
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
    name: 'uri',
    validator: uri(),
    code: 'format.uri',
    message: 'Must be a URI containing a scheme and value',
    valid: ['https://example.com', 'custom://value'],
    invalid: ['https://', 'example.com'],
  },
  {
    name: 'x509OtherName',
    validator: x509OtherName(),
    code: 'format.x509OtherName',
    message: 'Must use <oid>;<asn1-type>:<value> format',
    valid: ['1.2.3;UTF8:device', '1.2;IA5:'],
    invalid: ['1.2.3:UTF8:device', 'oid;UTF8:device'],
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
