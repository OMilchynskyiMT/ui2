import { describe, expect, it } from 'vitest'

import { inRange, integer, max, min, negative, positive } from '../../validators/number'
import { shouldValidate } from '../helpers'

describe('min', () => {
  it('returns the expected metadata', () => {
    const validator = min(1)
    expect(validator.code).toBe('number.min')
    expect(validator.message).toBe('Must be at least 1')
  })

  it.each([102, 105, 1000])('accepts %j', value => {
    expect(shouldValidate(min(101), value)).toBe(true)
  })

  it.each([1, 5, 100])('rejects %j', value => {
    expect(shouldValidate(min(101), value)).toBe(false)
  })

  it('uses a custom message', () => {
    const message = 'at least 2'
    const validator = min(1, { message })
    expect(validator.message).toBe(message)
  })
})

describe('max', () => {
  it('returns the expected metadata', () => {
    const validator = max(1)
    expect(validator.code).toBe('number.max')
    expect(validator.message).toBe('Must be at most 1')
  })

  it.each([1, 5, 100])('accepts %j', value => {
    expect(shouldValidate(max(101), value)).toBe(true)
  })

  it.each([102, 105, 1000])('rejects %j', value => {
    expect(shouldValidate(max(101), value)).toBe(false)
  })

  it('uses a custom message', () => {
    const message = 'at most 2'
    const validator = max(1, { message })
    expect(validator.message).toBe(message)
  })
})

describe('inRange', () => {
  it('returns the expected metadata', () => {
    const validator = inRange(1, 2)
    expect(validator.code).toBe('number.inRange')
    expect(validator.message).toBe('Must be between 1 and 2')
  })

  it.each([1, 2])('accepts %j', value => {
    expect(shouldValidate(inRange(1, 2), value)).toBe(true)
  })

  it.each([0, 3])('rejects %j', value => {
    expect(shouldValidate(inRange(1, 2), value)).toBe(false)
  })

  it('uses a custom message', () => {
    const message = 'between 1 and 2'
    const validator = inRange(1, 2, { message })
    expect(validator.message).toBe(message)
  })
})

describe('integer', () => {
  it('returns the expected metadata', () => {
    const validator = integer()
    expect(validator.code).toBe('number.integer')
    expect(validator.message).toBe('Must be an integer')
  })

  it.each([1, 2, 1001])('accepts %j', value => {
    expect(shouldValidate(integer(), value)).toBe(true)
  })

  it.each([1.1, 2.2, 1001.1])('rejects %j', value => {
    expect(shouldValidate(integer(), value)).toBe(false)
  })

  it('uses a custom message', () => {
    const message = 'an integer'
    const validator = integer({ message })
    expect(validator.message).toBe(message)
  })
})

describe('positive', () => {
  it('returns the expected metadata', () => {
    const validator = positive()
    expect(validator.code).toBe('number.positive')
    expect(validator.message).toBe('Must be a positive number')
  })

  it.each([1, 2, 1001])('accepts %j', value => {
    expect(shouldValidate(positive(), value)).toBe(true)
  })

  it.each([-1, -2, -1001])('rejects %j', value => {
    expect(shouldValidate(positive(), value)).toBe(false)
  })

  it('uses a custom message', () => {
    const message = 'a positive number'
    const validator = positive({ message })
    expect(validator.message).toBe(message)
  })
})

describe('negative', () => {
  it('returns the expected metadata', () => {
    const validator = negative()
    expect(validator.code).toBe('number.negative')
    expect(validator.message).toBe('Must be a negative number')
  })

  it.each([-1, -2, -1001])('accepts %j', value => {
    expect(shouldValidate(negative(), value)).toBe(true)
  })

  it.each([1, 2, 1001])('rejects %j', value => {
    expect(shouldValidate(negative(), value)).toBe(false)
  })

  it('uses a custom message', () => {
    const message = 'a negative number'
    const validator = negative({ message })
    expect(validator.message).toBe(message)
  })
})
