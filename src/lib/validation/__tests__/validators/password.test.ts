import { describe, expect, it } from 'vitest'

import type { Validator } from '../../types'
import { bootloaderPasswordCharacters, passwordComplexity, passwordStrength } from '../../validators/password'
import { getValidatorMessage, shouldValidate } from '../helpers'

type MetadataCase = readonly [name: string, validator: Validator<string>, code: string, message: string]

const metadataCases: readonly MetadataCase[] = [
  [
    'passwordStrength',
    passwordStrength(),
    'security.passwordStrength',
    'Must contain lowercase, uppercase, numeric, and special characters',
  ],
  [
    'bootloaderPasswordCharacters',
    bootloaderPasswordCharacters(),
    'security.bootloaderPasswordCharacters',
    'Contains characters that are not allowed in a bootloader password',
  ],
]

describe.each(metadataCases)('%s metadata', (_name, validator, code, message) => {
  it('uses a stable code and default message', () => {
    expect(validator.code).toBe(code)
    expect(validator.message).toBe(message)
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

describe('bootloaderPasswordCharacters', () => {
  const validator = bootloaderPasswordCharacters()

  it('checks only the allowed character set', () => {
    expect(shouldValidate(validator, 'a')).toBe(true)
    expect(shouldValidate(validator, 'a'.repeat(25))).toBe(true)
    expect(shouldValidate(validator, 'abc 123')).toBe(false)
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

  it('provides the specific specific failure reason', () => {
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
