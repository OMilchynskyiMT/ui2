import { describe, expect, it } from 'vitest'

import { inRange, matches, maxLength, minLength, oneOf } from '../../validators/string'
import { shouldValidate } from '../helpers'

describe('minLength', () => {
  it('returns the expected metadata', () => {
    const validator = minLength(1)
    expect(validator.code).toBe('string.minLength')
    expect(validator.message).toBe('Must contain at least 1 characters')
  })

  it.each(['123a', '123ab', '123abc'])('accepts %j', value => {
    expect(shouldValidate(minLength(3), value)).toBe(true)
  })

  it.each(['', 'a', 'ab'])('rejects %j', value => {
    expect(shouldValidate(minLength(3), value)).toBe(false)
  })

  it('uses a custom message', () => {
    const message = 'at least 2'
    const validator = minLength(1, { message })
    expect(validator.message).toBe(message)
  })
})

describe('maxLength', () => {
  it('returns the expected metadata', () => {
    const validator = maxLength(1)
    expect(validator.code).toBe('string.maxLength')
    expect(validator.message).toBe('Must contain at most 1 characters')
  })

  it.each(['', 'a', 'ab'])('accepts %j', value => {
    expect(shouldValidate(maxLength(3), value)).toBe(true)
  })

  it.each(['123a', '123ab', '123abc'])('rejects %j', value => {
    expect(shouldValidate(maxLength(3), value)).toBe(false)
  })

  it('uses a custom message', () => {
    const message = 'at most 2'
    const validator = maxLength(1, { message })
    expect(validator.message).toBe(message)
  })
})

describe('inRange', () => {
  it('returns the expected metadata', () => {
    const validator = inRange(1, 2)
    expect(validator.code).toBe('string.inRange')
    expect(validator.message).toBe('Must contain between 1 and 2 characters')
  })

  it.each(['a', 'ab', 'abc'])('accepts %j', value => {
    expect(shouldValidate(inRange(1, 3), value)).toBe(true)
  })

  it.each(['123a', '123ab', '123abc'])('rejects %j', value => {
    expect(shouldValidate(inRange(1, 3), value)).toBe(false)
  })

  it('uses a custom message', () => {
    const message = 'between 1 and 2'
    const validator = inRange(1, 2, { message })
    expect(validator.message).toBe(message)
  })
})

describe('matches', () => {
  it('returns the expected metadata', () => {
    const validator = matches(/a/)
    expect(validator.code).toBe('string.pattern')
    expect(validator.message).toBe('Does not match pattern')
  })

  it.each(['a', 'ab', 'abc'])('accepts %j', value => {
    expect(shouldValidate(matches(/a/), value)).toBe(true)
  })

  it.each(['123a', '123ab', '123abc'])('rejects %j', value => {
    expect(shouldValidate(matches(/j/), value)).toBe(false)
  })

  it('uses a custom message', () => {
    const message = 'does not match pattern'
    const validator = matches(/a/, { message })
    expect(validator.message).toBe(message)
  })
})

describe('oneOf', () => {
  it('returns the expected metadata', () => {
    const validator = oneOf(['a', 'b', 'c'])
    expect(validator.code).toBe('string.oneOf')
    expect(validator.message).toBe('Must be one of: a, b, c')
  })

  it.each(['a', 'b', 'c'])('accepts %j', value => {
    expect(shouldValidate(oneOf(['a', 'b', 'c']), value)).toBe(true)
  })

  it.each(['d', 'e', 'f'])('rejects %j', value => {
    expect(shouldValidate(oneOf(['a', 'b', 'c']), value)).toBe(false)
  })

  it('uses a custom message', () => {
    const message = 'must be one of: a, b, c'
    const validator = oneOf(['a', 'b', 'c'], { message })
    expect(validator.message).toBe(message)
  })
})
