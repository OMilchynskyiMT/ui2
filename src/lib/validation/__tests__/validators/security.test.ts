import { describe, expect, it } from 'vitest'

import type { Validator } from '../../types'
import {
  bootloaderPasswordCharacters,
  engineId,
  ipsecId,
  openVpnPeerFingerprint,
  passwordComplexity,
  passwordStrength,
  pemCertificate,
  pemPrivateKey,
  radiusSharedSecret,
  sshPublicKey,
} from '../../validators/security'
import { getValidatorMessage, shouldValidate } from '../helpers'

type MetadataCase = readonly [name: string, validator: Validator<string>, code: string, message: string]

const metadataCases: readonly MetadataCase[] = [
  ['sshPublicKey', sshPublicKey(), 'security.sshPublicKey', 'Must match SSH public key format'],
  [
    'openVpnPeerFingerprint',
    openVpnPeerFingerprint(),
    'security.openVpnPeerFingerprint',
    'Must be a valid OpenVPN peer fingerprint',
  ],
  ['engineId', engineId(), 'security.engineId', 'Must be a hexadecimal engine ID between 5 and 32 octets'],
  [
    'passwordStrength',
    passwordStrength(),
    'security.passwordStrength',
    'Must contain lowercase, uppercase, numeric, and special characters',
  ],
  ['radiusSharedSecret', radiusSharedSecret(), 'security.radiusSharedSecret', 'Must be a valid RADIUS shared secret'],
  [
    'bootloaderPasswordCharacters',
    bootloaderPasswordCharacters(),
    'security.bootloaderPasswordCharacters',
    'Contains characters that are not allowed in a bootloader password',
  ],
  ['pemCertificate', pemCertificate(), 'security.pemCertificate', 'Must contain a PEM certificate'],
  ['pemPrivateKey', pemPrivateKey(), 'security.pemPrivateKey', 'Must contain a PEM private key'],
  ['ipsecId', ipsecId(), 'security.ipsecId', 'Must not contain double quotes or a space-colon-space sequence'],
]

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

describe('engineId', () => {
  const validator = engineId()

  it.each(['0x0102030405', `0X${'ab'.repeat(32)}`])('accepts %j', value => {
    expect(shouldValidate(validator, value)).toBe(true)
  })

  it.each(['0102030405', '0x01020304', `0x${'ab'.repeat(33)}`])('rejects %j', value => {
    expect(shouldValidate(validator, value)).toBe(false)
  })
})

describe('passwordStrength', () => {
  const validator = passwordStrength()

  it('checks character classes without duplicating password-length rules', () => {
    expect(shouldValidate(validator, 'S1!a')).toBe(true)
    expect(shouldValidate(validator, 'strong1!')).toBe(false)
    expect(shouldValidate(validator, 'StrongPassword!')).toBe(false)
    expect(shouldValidate(validator, 'Strong12')).toBe(false)
  })
})

describe('radiusSharedSecret', () => {
  const validator = radiusSharedSecret()

  it('accepts the legacy hexadecimal form', () => {
    expect(shouldValidate(validator, 'ab'.repeat(32))).toBe(true)
    expect(shouldValidate(validator, `0x${'ab'.repeat(32)}`)).toBe(true)
  })

  it('accepts sufficiently long mixed-character secrets', () => {
    expect(shouldValidate(validator, 'Abcdefghijklmnopqr1!xyz')).toBe(true)
    expect(shouldValidate(validator, 'Abc1!short')).toBe(false)
  })
})

describe('bootloaderPasswordCharacters', () => {
  const validator = bootloaderPasswordCharacters()

  it('checks only the legacy allowed character set', () => {
    expect(shouldValidate(validator, 'a')).toBe(true)
    expect(shouldValidate(validator, 'a'.repeat(25))).toBe(true)
    expect(shouldValidate(validator, 'abc 123')).toBe(false)
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

describe('ipsecId', () => {
  const validator = ipsecId()

  it('preserves the two forbidden legacy sequences', () => {
    expect(shouldValidate(validator, '')).toBe(true)
    expect(shouldValidate(validator, 'peer@example')).toBe(true)
    expect(shouldValidate(validator, 'bad"id')).toBe(false)
    expect(shouldValidate(validator, 'left : right')).toBe(false)
  })
})

describe('passwordComplexity', () => {
  const rules = {
    creditMode: false,
    minPasswordLength: 8,
    maxPasswordLength: 12,
    charactersNotPermitted: ':',
  }
  const validator = passwordComplexity(rules)

  it('validates prohibited characters and configured lengths', () => {
    expect(shouldValidate(validator, 'password')).toBe(true)
    expect(shouldValidate(validator, 'pass:word')).toBe(false)
    expect(shouldValidate(validator, 'short')).toBe(false)
    expect(shouldValidate(validator, 'this-is-too-long')).toBe(false)
  })

  it('provides the specific legacy-compatible failure reason', () => {
    expect(getValidatorMessage(validator, 'pass:word')).toBe('Password must not include any of the characters: :')
    expect(getValidatorMessage(validator, 'short')).toBe('Password length must be at least 8')
    expect(getValidatorMessage(validator, 'this-is-too-long')).toBe('Password length must not exceed 12')
  })

  it('rejects invalid complexity configuration', () => {
    expect(() => passwordComplexity({ ...rules, minPasswordLength: -1 })).toThrow(RangeError)
    expect(() => passwordComplexity({ ...rules, maxPasswordLength: 1.5 })).toThrow(RangeError)
    expect(() => passwordComplexity({ ...rules, minPasswordLength: 13 })).toThrow(RangeError)
  })

  it('does not apply min/max length checks in credit mode', () => {
    const creditMode = passwordComplexity({ ...rules, creditMode: true })
    expect(shouldValidate(creditMode, 'x')).toBe(true)
  })
})
