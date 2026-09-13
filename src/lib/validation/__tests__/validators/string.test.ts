import { describe, expect, it } from 'vitest'

import {
  email,
  endsWith,
  inRange,
  length,
  matches,
  maxLength,
  minLength,
  nonBlank,
  startsWith,
} from '../../validators/string'
import { shouldValidate } from '../helpers'

describe('nonBlank', () => {
  const validator = nonBlank()

  it('rejects values that contain only whitespace', () => {
    expect(validator.code).toBe('string.nonBlank')
    expect(validator.message).toBe('Must not be blank')
    expect(shouldValidate(validator, 'value')).toBe(true)
    expect(shouldValidate(validator, ' value ')).toBe(true)
    expect(shouldValidate(validator, ' '.repeat(3))).toBe(false)
  })
})

describe('length', () => {
  const validator = length(3)

  it('validates exact string length', () => {
    expect(validator.code).toBe('string.length')
    expect(validator.message).toBe('Must contain exactly 3 characters')
    expect(shouldValidate(validator, 'abc')).toBe(true)
    expect(shouldValidate(validator, 'ab')).toBe(false)
    expect(shouldValidate(validator, 'abcd')).toBe(false)
  })

  it('rejects invalid configuration', () => {
    expect(() => length(-1)).toThrow(RangeError)
    expect(() => length(1.5)).toThrow(RangeError)
  })
})

describe('minLength', () => {
  const validator = minLength(3)

  it('validates minimum string length', () => {
    expect(validator.code).toBe('string.minLength')
    expect(validator.message).toBe('Must contain at least 3 characters')
    expect(shouldValidate(validator, 'abc')).toBe(true)
    expect(shouldValidate(validator, 'abcd')).toBe(true)
    expect(shouldValidate(validator, 'ab')).toBe(false)
  })

  it('rejects invalid configuration', () => {
    expect(() => minLength(-1)).toThrow(RangeError)
    expect(() => minLength(NaN)).toThrow(RangeError)
  })
})

describe('maxLength', () => {
  const validator = maxLength(3)

  it('validates maximum string length', () => {
    expect(validator.code).toBe('string.maxLength')
    expect(validator.message).toBe('Must contain at most 3 characters')
    expect(shouldValidate(validator, '')).toBe(true)
    expect(shouldValidate(validator, 'abc')).toBe(true)
    expect(shouldValidate(validator, 'abcd')).toBe(false)
  })

  it('rejects invalid configuration', () => {
    expect(() => maxLength(-1)).toThrow(RangeError)
    expect(() => maxLength(Infinity)).toThrow(RangeError)
  })
})

describe('inRange', () => {
  const validator = inRange(2, 4)

  it('validates inclusive string-length bounds', () => {
    expect(validator.code).toBe('string.inRange')
    expect(validator.message).toBe('Must contain between 2 and 4 characters')
    expect(shouldValidate(validator, 'ab')).toBe(true)
    expect(shouldValidate(validator, 'abcd')).toBe(true)
    expect(shouldValidate(validator, 'a')).toBe(false)
    expect(shouldValidate(validator, 'abcde')).toBe(false)
  })

  it('rejects invalid configuration', () => {
    expect(() => inRange(-1, 2)).toThrow(RangeError)
    expect(() => inRange(3, 2)).toThrow(RangeError)
  })
})

describe('startsWith', () => {
  const validator = startsWith('89')

  it('validates the required prefix', () => {
    expect(validator.code).toBe('string.startsWith')
    expect(validator.message).toBe('Must start with 89')
    expect(shouldValidate(validator, '89123')).toBe(true)
    expect(shouldValidate(validator, '88123')).toBe(false)
  })

  it('rejects an empty prefix', () => {
    expect(() => startsWith('')).toThrow(TypeError)
  })
})

describe('endsWith', () => {
  const validator = endsWith('99')

  it('validates the required suffix', () => {
    expect(validator.code).toBe('string.endsWith')
    expect(validator.message).toBe('Must end with 99')
    expect(shouldValidate(validator, '12399')).toBe(true)
    expect(shouldValidate(validator, '12300')).toBe(false)
  })

  it('rejects an empty suffix', () => {
    expect(() => endsWith('')).toThrow(TypeError)
  })
})

describe('matches', () => {
  const validator = matches(/a/)

  it('validates the pattern', () => {
    expect(validator.code).toBe('string.pattern')
    expect(validator.message).toBe('Does not match pattern')
    expect(shouldValidate(validator, 'abc')).toBe(true)
    expect(shouldValidate(validator, 'xyz')).toBe(false)
  })

  it('is stable for stateful regular expressions', () => {
    const stateful = matches(/a/g)
    expect(shouldValidate(stateful, 'a')).toBe(true)
    expect(shouldValidate(stateful, 'a')).toBe(true)
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

it('supports custom messages', () => {
  expect(minLength(1, { message: 'custom' }).message).toBe('custom')
})
