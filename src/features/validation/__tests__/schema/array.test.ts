import { describe, expect, it } from 'vitest'

import { array, number, string } from '@/features/validation'

describe('array schema', () => {
  it('returns numeric item paths for invalid array elements', () => {
    const schema = array(number())
    const result = schema.safeParse([1, 'oops', 3])

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [1],
          code: 'number.type',
          message: 'Must be a number',
          input: 'oops',
        },
      ])
      expect(result.errors).toEqual({
        '1': ['Must be a number'],
      })
    }
  })

  it('preserves positional undefined values for optional item schemas', () => {
    const schema = array(string().optional())
    const result = schema.safeParse(['a', undefined, 'b'])

    expect(result).toMatchObject({
      ok: true,
      value: ['a', undefined, 'b'],
    })
  })

  it('applies array-level length refinements as node-level errors', () => {
    const result = array(string()).min(2).safeParse(['only-one'])

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [],
          code: 'array.min',
          message: 'Must contain at least 2 items',
          input: ['only-one'],
        },
      ])
      expect(result.errors).toEqual({
        _errors: ['Must contain at least 2 items'],
      })
    }
  })

  it('uses default factory per parse call for mutable arrays', () => {
    const schema = array(string()).default(() => ['fallback'])

    const first = schema.safeParse(undefined)
    const second = schema.safeParse(undefined)

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)

    if (first.ok && second.ok) {
      first.value.push('changed')

      expect(second.value).toEqual(['fallback'])
    }
  })

  it('supports preprocess, items replacement, optionality, and rejects non-arrays', () => {
    expect(
      array(string())
        .preprocess(input => (input === 'a,b' ? ['a', 'b'] : input))
        .safeParse('a,b')
    ).toMatchObject({
      ok: true,
      value: ['a', 'b'],
    })

    expect(array(string()).items(number()).safeParse([1, 2])).toMatchObject({
      ok: true,
      value: [1, 2],
    })

    expect(array(string()).optional().safeParse(undefined)).toMatchObject({ ok: true, value: undefined })
    expect(array(string()).nullable().safeParse(null)).toMatchObject({ ok: true, value: null })

    const nonnullable = array(string()).nullable().nonnullable('Array cannot be null').safeParse(null)
    expect(nonnullable.ok).toBe(false)
    if (!nonnullable.ok) {
      expect(nonnullable.errors).toEqual({ _errors: ['Array cannot be null'] })
    }

    const notArray = array(string()).safeParse('oops')
    expect(notArray.ok).toBe(false)
    if (!notArray.ok) {
      expect(notArray.errors).toEqual({ _errors: ['Must be an array'] })
    }
  })

  it('supports max and exact length checks', () => {
    const tooLong = array(string()).max(1).safeParse(['a', 'b'])
    const wrongLength = array(string()).length(2).safeParse(['a'])

    expect(tooLong.ok).toBe(false)
    expect(wrongLength.ok).toBe(false)

    if (!tooLong.ok) {
      expect(tooLong.errors).toEqual({ _errors: ['Must contain at most 1 items'] })
    }

    if (!wrongLength.ok) {
      expect(wrongLength.errors).toEqual({ _errors: ['Must contain exactly 2 items'] })
    }
  })
})
