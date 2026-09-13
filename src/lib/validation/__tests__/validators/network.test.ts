import { describe, expect, it } from 'vitest'

import type { Validator } from '../../types'
import {
  availableServerPort,
  domainName,
  domainOrIpAddress,
  ipv4Address,
  ipv4Cidr,
  ipv4Gateway,
  ipv4InNetwork,
  ipv4Mask,
  ipv4Netmask,
  ipv4RangeEnd,
  ipv6Address,
  ipv6InterfaceAddress,
  ipv6InterfaceAddressWithPrefix,
  ipv6LinkLocalAddress,
  ipv6LinkLocalWithPrefix,
  ipv6WithPrefix,
  leaseTime,
  macAddress,
  nonOverlappingIpv4Network,
  phoneNumber,
  portCsv,
  portRange,
  publicUrl,
  ssid,
  trapIpv4Address,
} from '../../validators/network'
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
    name: 'ipv4Address',
    validator: ipv4Address(),
    code: 'network.ipv4Address',
    message: 'Must be a valid IPv4 address',
    valid: ['0.0.0.0', '192.168.1.1', '255.255.255.255'],
    invalid: ['192.168.1', '256.0.0.1', '192.168.01.1'],
  },
  {
    name: 'ipv4Cidr',
    validator: ipv4Cidr(),
    code: 'network.ipv4Cidr',
    message: 'Must be a valid IPv4 CIDR network',
    valid: ['10.0.0.0/24', '192.168.1.123/24', '0.0.0.0/0'],
    invalid: ['10.0.0.0', '10.0.0.0/33', 'invalid/24'],
  },
  {
    name: 'ipv4Netmask',
    validator: ipv4Netmask(),
    code: 'network.ipv4Netmask',
    message: 'Must be a valid IPv4 network mask',
    valid: ['0.0.0.0', '255.255.255.0', '255.255.128.0', '255.255.255.255'],
    invalid: ['255.0.255.0', '255.255.127.0', '24'],
  },
  {
    name: 'ipv6Address',
    validator: ipv6Address(),
    code: 'network.ipv6Address',
    message: 'Must be a valid IPv6 address',
    valid: ['::1', '2001:db8::1', 'fe80::1234', '::ffff:192.168.1.1'],
    invalid: ['2001:::1', 'gggg::1', '2001:db8::1/64'],
  },
  {
    name: 'ipv6WithPrefix',
    validator: ipv6WithPrefix(),
    code: 'network.ipv6WithPrefix',
    message: 'Must be a valid IPv6 address with prefix',
    valid: ['2001:db8::1/64', '::1/128', '2001:db8::1/64suffix', '2001:db8::1/64/ignored'],
    invalid: ['2001:db8::1', '2001:db8::1/129', '2001:db8::1/nope'],
  },
  {
    name: 'ipv6LinkLocalAddress',
    validator: ipv6LinkLocalAddress(),
    code: 'network.ipv6LinkLocalAddress',
    message: 'Must be an IPv6 link-local address',
    valid: ['fe80::1', 'febf::1'],
    invalid: ['fe8::1', 'fec0::1', '2001:db8::1'],
  },
  {
    name: 'ipv6LinkLocalWithPrefix',
    validator: ipv6LinkLocalWithPrefix(),
    code: 'network.ipv6LinkLocalWithPrefix',
    message: 'Must be an IPv6 link-local address with prefix',
    valid: ['fe80::1/64'],
    invalid: ['fe80::1', 'fec0::1/64', 'fe80::1/129'],
  },
  {
    name: 'ipv6InterfaceAddress',
    validator: ipv6InterfaceAddress(),
    code: 'network.ipv6InterfaceAddress',
    message: 'Must be an applicable IPv6 interface address',
    valid: ['2001:db8::1', 'fe80::1'],
    invalid: ['::', '::1', 'ff02::1'],
  },
  {
    name: 'ipv6InterfaceAddressWithPrefix',
    validator: ipv6InterfaceAddressWithPrefix(),
    code: 'network.ipv6InterfaceAddressWithPrefix',
    message: 'Must be an applicable IPv6 interface address with prefix',
    valid: ['2001:db8::1/64', 'fe80::1/64'],
    invalid: ['::/64', '::1/128', 'ff02::1/64'],
  },
  {
    name: 'trapIpv4Address',
    validator: trapIpv4Address(),
    code: 'network.trapIpv4Address',
    message: 'Must not be in 127.0.0.0/8 or 224.0.0.0/3',
    valid: ['10.0.0.1', '223.255.255.255', 'not-an-ip'],
    invalid: ['127.0.0.1', '224.0.0.1', '255.255.255.255'],
  },
  {
    name: 'macAddress',
    validator: macAddress(),
    code: 'network.macAddress',
    message: 'Must be a valid MAC address',
    valid: ['00:11:22:aa:BB:ff', '00-11-22-AA-BB-FF'],
    invalid: ['001122AABBFF', '00:11:22:33:44', '00:11:22:33:44:GG'],
  },
  {
    name: 'phoneNumber',
    validator: phoneNumber(),
    code: 'network.phoneNumber',
    message: 'Must be a valid phone number',
    valid: ['+1 800 555-0100', '+(1) 800 555-0100', '380501234567'],
    invalid: ['phone', '+abc'],
  },
  {
    name: 'leaseTime',
    validator: leaseTime(),
    code: 'network.leaseTime',
    message: 'Must use DDD-HH-MM lease-time format',
    valid: ['1-2-3', '999-99-99'],
    invalid: ['1:2:3', '1-2', '1000-1-1'],
  },
  {
    name: 'domainName',
    validator: domainName(),
    code: 'network.domainName',
    message: 'Must be a valid domain name',
    valid: ['example.com', 'sub.example.org'],
    invalid: ['localhost', 'example', 'example.technology'],
  },
  {
    name: 'domainOrIpAddress',
    validator: domainOrIpAddress(),
    code: 'network.domainOrIpAddress',
    message: 'Must be a valid hostname, IPv4 address, or IPv6 address',
    valid: ['localhost', 'device.local', '192.168.1.1', '2001:db8::1', ' 2001:db8::1 '],
    invalid: ['bad host', '256.1.1.1', 'host_name'],
  },
  {
    name: 'publicUrl',
    validator: publicUrl(),
    code: 'network.publicUrl',
    message: 'Must be a valid public HTTP, HTTPS, or FTP URL',
    valid: ['https://example.com/path', 'ftp://example.com/file'],
    invalid: ['http://192.168.1.1/path', 'https://localhost/path', 'example.com'],
  },
  {
    name: 'ssid',
    validator: ssid(),
    code: 'network.ssid',
    message: 'Must be a valid SSID',
    valid: ['Office WiFi', '@network'],
    invalid: ['', ' '.repeat(6), '#hidden', 'bad"ssid', 'bad$ssid'],
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

describe('portRange', () => {
  const validator = portRange()

  it('preserves string and numeric legacy inputs', () => {
    expect(validator.code).toBe('network.portRange')
    expect(validator.message).toBe('Must be a valid port or ascending port range')
    expect(shouldValidate(validator, 80)).toBe(true)
    expect(shouldValidate(validator, '80-443')).toBe(true)
    expect(shouldValidate(validator, '80:443')).toBe(true)
    expect(shouldValidate(validator, 0)).toBe(false)
    expect(shouldValidate(validator, '443-80')).toBe(false)
    expect(shouldValidate(validator, '1-2-3')).toBe(false)
  })
})

describe('portCsv', () => {
  const validator = portCsv()

  it('preserves string and numeric legacy inputs', () => {
    expect(validator.code).toBe('network.portCsv')
    expect(validator.message).toBe('Must be a comma-separated list of ports or port ranges')
    expect(shouldValidate(validator, 443)).toBe(true)
    expect(shouldValidate(validator, '80,443,1000-2000')).toBe(true)
    expect(shouldValidate(validator, 65_536)).toBe(false)
    expect(shouldValidate(validator, '80,0')).toBe(false)
    expect(shouldValidate(validator, '80,443-80')).toBe(false)
  })
})

describe('ipv4Mask', () => {
  const validator = ipv4Mask()

  it('accepts both legacy numeric prefixes and dotted masks', () => {
    expect(validator.code).toBe('network.ipv4Mask')
    expect(validator.message).toBe('Must be an IPv4 prefix between 0 and 32 or a valid dotted-decimal netmask')
    expect(shouldValidate(validator, 24)).toBe(true)
    expect(shouldValidate(validator, '24')).toBe(true)
    expect(shouldValidate(validator, '255.255.255.0')).toBe(true)
    expect(shouldValidate(validator, 33)).toBe(false)
    expect(shouldValidate(validator, '01')).toBe(false)
    expect(shouldValidate(validator, '255.0.255.0')).toBe(false)
  })
})

describe('ipv4Gateway', () => {
  const validator = ipv4Gateway('192.168.1.10', '255.255.255.0')

  it('requires a usable address in the same network', () => {
    expect(validator.code).toBe('network.ipv4Gateway')
    expect(shouldValidate(validator, '192.168.1.1')).toBe(true)
    expect(shouldValidate(validator, '192.168.1.0')).toBe(false)
    expect(shouldValidate(validator, '192.168.1.255')).toBe(false)
    expect(shouldValidate(validator, '192.168.2.1')).toBe(false)
    expect(shouldValidate(validator, 'invalid')).toBe(true)
  })

  it('preserves legacy network applicability constraints', () => {
    expect(shouldValidate(ipv4Gateway('67.62.196.61', '0.0.0.0'), '66.165.34.227')).toBe(false)
    expect(shouldValidate(ipv4Gateway('127.0.0.10', 24), '127.0.0.1')).toBe(false)
  })
})

describe('ipv4InNetwork', () => {
  const validator = ipv4InNetwork('10.0.0.0', '24')

  it('supports the legacy numeric-string mask form', () => {
    expect(validator.code).toBe('network.ipv4InNetwork')
    expect(shouldValidate(validator, '10.0.0.1')).toBe(true)
    expect(shouldValidate(validator, '10.0.0.254')).toBe(true)
    expect(shouldValidate(validator, '10.0.0.0')).toBe(false)
    expect(shouldValidate(validator, '10.0.0.255')).toBe(false)
    expect(shouldValidate(validator, 'invalid')).toBe(true)
  })

  it('preserves the legacy non-normalizing network argument behavior', () => {
    const legacy = ipv4InNetwork('10.0.0.5', 24)
    expect(shouldValidate(legacy, '10.0.0.5')).toBe(false)
    expect(shouldValidate(legacy, '10.0.0.6')).toBe(true)
  })

  it('preserves the legacy signed /0 range behavior', () => {
    const legacy = ipv4InNetwork('67.51.90.72', '0.0.0.0')
    expect(shouldValidate(legacy, '67.62.196.61')).toBe(false)
  })
})

describe('ipv4RangeEnd', () => {
  const validator = ipv4RangeEnd('10.0.0.10')

  it('requires an IPv4 endpoint at or after the start', () => {
    expect(validator.code).toBe('network.ipv4RangeEnd')
    expect(shouldValidate(validator, '10.0.0.10')).toBe(true)
    expect(shouldValidate(validator, '10.0.0.11')).toBe(true)
    expect(shouldValidate(validator, '10.0.0.9')).toBe(false)
    expect(shouldValidate(validator, 'invalid')).toBe(true)
  })
})

describe('nonOverlappingIpv4Network', () => {
  const validator = nonOverlappingIpv4Network(['10.0.0.0/24', '192.168.0.0/16'])

  it('rejects overlap regardless of which CIDR is more specific', () => {
    expect(validator.code).toBe('network.nonOverlappingIpv4Network')
    expect(shouldValidate(validator, '10.0.1.0/24')).toBe(true)
    expect(shouldValidate(validator, '10.0.0.128/25')).toBe(false)
    expect(shouldValidate(validator, '10.0.0.0/16')).toBe(false)
    expect(shouldValidate(validator, 'invalid')).toBe(true)
  })
})

describe('availableServerPort', () => {
  const validator = availableServerPort('HTTP')

  it('rejects ports reserved by another legacy service', () => {
    expect(validator.code).toBe('network.availableServerPort')
    expect(shouldValidate(validator, 443)).toBe(true)
    expect(shouldValidate(validator, 53)).toBe(false)
    expect(getValidatorMessage(validator, 53)).toBe('Port 53 is reserved for DNS')
  })

  it('does not duplicate generic port-range validation', () => {
    expect(shouldValidate(validator, 0)).toBe(true)
    expect(shouldValidate(validator, 65_536)).toBe(true)
    expect(shouldValidate(validator, 80.5)).toBe(true)
  })

  it('allows the port reserved for the selected service', () => {
    expect(shouldValidate(availableServerPort('DNS'), 53)).toBe(true)
  })

  it('preserves the legacy SMTP reserved-port table', () => {
    expect(shouldValidate(availableServerPort('HTTP'), 57)).toBe(false)
    expect(getValidatorMessage(availableServerPort('HTTP'), 57)).toBe('Port 57 is reserved for SMTP')
    expect(shouldValidate(availableServerPort('SMTP'), 57)).toBe(true)
  })
})
