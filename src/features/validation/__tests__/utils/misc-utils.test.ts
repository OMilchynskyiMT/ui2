import { describe, expect, it } from 'vitest'

import { formatLiteral, formatLiteralList } from '@/features/validation/utils/format-literal'
import { isPlainObject } from '@/features/validation/utils/is-plain-object'

describe('formatLiteral utils', () => {
  it('formats single literals and literal lists', () => {
    expect(formatLiteral('email')).toBe('"email"')
    expect(formatLiteral(true)).toBe('true')
    expect(formatLiteralList(['email', false, 2])).toBe('"email", false, 2')
  })
})

describe('isPlainObject', () => {
  it('accepts plain objects and rejects arrays, null, and class instances', () => {
    class Example {
      public value = 1
    }

    expect(isPlainObject({ ok: true })).toBe(true)
    expect(isPlainObject(Object.create(null))).toBe(true)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(new Example())).toBe(false)
  })
})
