import { describe, expect, it } from 'vitest'

import { inRange, inRanges, integer, max, min, negative, positive } from '../../validators/number'
import { shouldValidate } from '../helpers'

describe('min', () => {
  const validator = min(10)

  it('validates the inclusive lower bound', () => {
    expect(validator.code).toBe('number.min')
    expect(validator.message).toBe('Must be at least 10')
    expect(shouldValidate(validator, 10)).toBe(true)
    expect(shouldValidate(validator, 11)).toBe(true)
    expect(shouldValidate(validator, 9)).toBe(false)
  })

  it('rejects non-finite configuration', () => {
    expect(() => min(NaN)).toThrow(RangeError)
    expect(() => min(-Infinity)).toThrow(RangeError)
  })
})

describe('max', () => {
  const validator = max(10)

  it('validates the inclusive upper bound', () => {
    expect(validator.code).toBe('number.max')
    expect(validator.message).toBe('Must be at most 10')
    expect(shouldValidate(validator, 9)).toBe(true)
    expect(shouldValidate(validator, 10)).toBe(true)
    expect(shouldValidate(validator, 11)).toBe(false)
  })

  it('rejects non-finite configuration', () => {
    expect(() => max(NaN)).toThrow(RangeError)
    expect(() => max(Infinity)).toThrow(RangeError)
  })
})

describe('inRange', () => {
  const validator = inRange(1, 2)

  it('validates inclusive numeric bounds', () => {
    expect(validator.code).toBe('number.inRange')
    expect(validator.message).toBe('Must be between 1 and 2')
    expect(shouldValidate(validator, 1)).toBe(true)
    expect(shouldValidate(validator, 2)).toBe(true)
    expect(shouldValidate(validator, 0)).toBe(false)
    expect(shouldValidate(validator, 3)).toBe(false)
  })

  it('rejects invalid configuration', () => {
    expect(() => inRange(2, 1)).toThrow(RangeError)
    expect(() => inRange(1, Infinity)).toThrow(RangeError)
  })
})

describe('inRanges', () => {
  it('accepts any configured range', () => {
    const validator = inRanges([
      [10, 20],
      [30, 40],
    ])

    expect(validator.code).toBe('number.inRanges')
    expect(validator.message).toBe('Must be within 10-20, 30-40')
    expect(shouldValidate(validator, 10)).toBe(true)
    expect(shouldValidate(validator, 35)).toBe(true)
    expect(shouldValidate(validator, 25)).toBe(false)
  })

  it('accepts explicit values outside configured ranges', () => {
    const validator = inRanges([[10, 20]], { include: [0] })

    expect(validator.message).toBe('Must be within 10-20 or 0')
    expect(shouldValidate(validator, 0)).toBe(true)
    expect(shouldValidate(validator, 15)).toBe(true)
    expect(shouldValidate(validator, 9)).toBe(false)
  })

  it('rejects invalid configuration', () => {
    expect(() => inRanges([])).toThrow(TypeError)
    expect(() => inRanges([[20, 10]])).toThrow(RangeError)
    expect(() => inRanges([[NaN, 10]])).toThrow(RangeError)
    expect(() => inRanges([[1, 2]], { include: [Infinity] })).toThrow(RangeError)
  })
})

describe('integer', () => {
  const validator = integer()

  it('accepts integer-valued numbers', () => {
    expect(validator.code).toBe('number.integer')
    expect(validator.message).toBe('Must be an integer')
    expect(shouldValidate(validator, 1)).toBe(true)
    expect(shouldValidate(validator, Number.MAX_SAFE_INTEGER)).toBe(true)
    expect(shouldValidate(validator, 1.5)).toBe(false)
    expect(shouldValidate(validator, Number.MAX_SAFE_INTEGER + 1)).toBe(true)
  })
})

describe('positive', () => {
  const validator = positive()

  it('accepts values greater than zero', () => {
    expect(validator.code).toBe('number.positive')
    expect(validator.message).toBe('Must be a positive number')
    expect(shouldValidate(validator, 1)).toBe(true)
    expect(shouldValidate(validator, 0)).toBe(false)
    expect(shouldValidate(validator, -1)).toBe(false)
  })
})

describe('negative', () => {
  const validator = negative()

  it('accepts values lower than zero', () => {
    expect(validator.code).toBe('number.negative')
    expect(validator.message).toBe('Must be a negative number')
    expect(shouldValidate(validator, -1)).toBe(true)
    expect(shouldValidate(validator, 0)).toBe(false)
    expect(shouldValidate(validator, 1)).toBe(false)
  })
})

it('supports custom messages', () => {
  expect(inRange(1, 2, { message: 'custom' }).message).toBe('custom')
})
