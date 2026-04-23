import { describe, expect, it } from 'vitest'

import {
  coerceToBoolean,
  coerceToNumber,
  coerceToString,
  emptyStringAsUndefined,
} from '@/features/validation/utils/coerce'

describe('coerce utils', () => {
  it('coerceToString leaves string-like absence values unchanged and converts primitives', () => {
    expect(coerceToString('x')).toBe('x')
    expect(coerceToString(undefined)).toBeUndefined()
    expect(coerceToString(null)).toBeNull()
    expect(coerceToString(12)).toBe('12')
    expect(coerceToString(false)).toBe('false')
    expect(coerceToString(12n)).toBe('12')
    expect(coerceToString({ value: 1 })).toEqual({ value: 1 })
  })

  it('coerceToNumber only converts valid non-empty numeric strings', () => {
    expect(coerceToNumber(3)).toBe(3)
    expect(coerceToNumber(' 3 ')).toBe(3)
    expect(coerceToNumber('')).toBe('')
    expect(coerceToNumber('nope')).toBe('nope')
    expect(coerceToNumber(true)).toBe(true)
  })

  it('coerceToBoolean supports common representations and leaves unknown inputs untouched', () => {
    expect(coerceToBoolean(true)).toBe(true)
    expect(coerceToBoolean(1)).toBe(true)
    expect(coerceToBoolean(0)).toBe(false)
    expect(coerceToBoolean(2)).toBe(2)
    expect(coerceToBoolean(' YES ')).toBe(true)
    expect(coerceToBoolean('off')).toBe(false)
    expect(coerceToBoolean('maybe')).toBe('maybe')
    expect(coerceToBoolean({})).toEqual({})
  })

  it('emptyStringAsUndefined only rewrites the empty string', () => {
    expect(emptyStringAsUndefined('')).toBeUndefined()
    expect(emptyStringAsUndefined(' ')).toBe(' ')
    expect(emptyStringAsUndefined(0)).toBe(0)
  })
})
