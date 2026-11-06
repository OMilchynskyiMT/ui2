import { describe, expect, it } from 'vitest'

import type { Validator } from '../../types'
import {
  key,
  openVpnPeerFingerprint,
  pemCertificate,
  pemPrivateKey,
  radiusSharedSecret,
  sshPublicKey,
  x509OtherName,
} from '../../validators/credentials'
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
    name: 'x509OtherName',
    validator: x509OtherName(),
    code: 'format.x509OtherName',
    message: 'Must use <oid>;<asn1-type>:<value> format',
    valid: ['1.2.3;UTF8:device', '1.2;IA5:'],
    invalid: ['1.2.3:UTF8:device', 'oid;UTF8:device'],
  },
  {
    name: 'key',
    validator: key(),
    code: 'lora.key',
    message: 'Must be a 16-byte hexadecimal key',
    valid: ['000102030405060708090A0B0C0D0E0F', '00-01-02-03-04-05-06-07-08-09-0A-0B-0C-0D-0E-0F'],
    invalid: ['000102030405060708090A0B0C0D0E', '00-01-02-03'],
  },
]

const metadataCases: readonly MetadataCase[] = [
  ['sshPublicKey', sshPublicKey(), 'security.sshPublicKey', 'Must match SSH public key format'],
  [
    'openVpnPeerFingerprint',
    openVpnPeerFingerprint(),
    'security.openVpnPeerFingerprint',
    'Must be a valid OpenVPN peer fingerprint',
  ],
  ['radiusSharedSecret', radiusSharedSecret(), 'security.radiusSharedSecret', 'Must be a valid RADIUS shared secret'],
  ['pemCertificate', pemCertificate(), 'security.pemCertificate', 'Must contain a PEM certificate'],
  ['pemPrivateKey', pemPrivateKey(), 'security.pemPrivateKey', 'Must contain a PEM private key'],
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

describe.each(metadataCases)('%s metadata', (_name, validator, code, message) => {
  it('uses a stable code and default message', () => {
    expect(validator.code).toBe(code)
    expect(validator.message).toBe(message)
  })
})

describe('sshPublicKey', () => {
  const validator = sshPublicKey()

  it.each(['ssh-rsa AAAAabc123== user@example', 'ssh-ed25519 AAAAabcd'])('accepts %j', value => {
    expect(shouldValidate(validator, value)).toBe(true)
  })

  it('checks key syntax without duplicating control-character validation', () => {
    expect(shouldValidate(validator, 'ssh-rsa not-base64')).toBe(false)
    expect(shouldValidate(validator, 'ssh-rsa AAAAabc\n123')).toBe(true)
  })
})

describe('openVpnPeerFingerprint', () => {
  const validator = openVpnPeerFingerprint()
  const valid = Array.from({ length: 32 }, () => 'ab').join(':')

  it('accepts exactly 32 colon-separated bytes', () => {
    expect(shouldValidate(validator, valid)).toBe(true)
    expect(shouldValidate(validator, `${valid}:ab`)).toBe(false)
    expect(shouldValidate(validator, valid.replace(':', '-'))).toBe(false)
  })
})

describe('radiusSharedSecret', () => {
  const validator = radiusSharedSecret()

  it('accepts the hexadecimal form', () => {
    expect(shouldValidate(validator, 'ab'.repeat(32))).toBe(true)
    expect(shouldValidate(validator, `0x${'ab'.repeat(32)}`)).toBe(true)
  })

  it('accepts sufficiently long mixed-character secrets', () => {
    expect(shouldValidate(validator, 'Abcdefghijklmnopqr1!xyz')).toBe(true)
    expect(shouldValidate(validator, 'Abc1!short')).toBe(false)
  })
})

describe('pemCertificate', () => {
  const validator = pemCertificate()

  it('accepts certificate-like PEM blocks', () => {
    expect(shouldValidate(validator, '-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----')).toBe(true)
    expect(shouldValidate(validator, 'certificate')).toBe(false)
  })
})

describe('pemPrivateKey', () => {
  const validator = pemPrivateKey()

  it('requires a PRIVATE KEY PEM block', () => {
    expect(shouldValidate(validator, '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----')).toBe(true)
    expect(shouldValidate(validator, '-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----')).toBe(false)
  })
})
