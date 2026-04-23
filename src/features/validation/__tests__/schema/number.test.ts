import { describe, expect, it } from 'vitest'

import { number } from '@/features/validation'

describe('number schema', () => {
  it('coerces numeric strings to numbers', () => {
    const result = number().coerce().safeParse(' 42 ')

    expect(result).toMatchObject({
      ok: true,
      value: 42,
      issues: [],
      errors: {},
    })
  })

  it('does not coerce an empty string to zero', () => {
    const result = number().coerce().safeParse('')

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [],
          code: 'number.type',
          message: 'Must be a number',
          input: '',
        },
      ])
      expect(result.errors).toEqual({
        _errors: ['Must be a number'],
      })
    }
  })

  it('supports emptyAsUndefined with optional for form-like inputs', () => {
    const result = number().emptyAsUndefined().optional().safeParse('')

    expect(result).toMatchObject({
      ok: true,
      value: undefined,
      issues: [],
      errors: {},
    })
  })

  it('applies integer and range refinements', () => {
    const result = number().integer().min(1).max(10).safeParse(3.5)

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [],
          code: 'number.integer',
          message: 'Must be an integer',
          input: 3.5,
        },
      ])
      expect(result.errors).toEqual({
        _errors: ['Must be an integer'],
      })
    }
  })

  it('supports nullable, nonnullable, default factory, and custom preprocess', () => {
    expect(number().nullable().safeParse(null)).toMatchObject({ ok: true, value: null })
    expect(
      number()
        .default(() => 7)
        .safeParse(undefined)
    ).toMatchObject({ ok: true, value: 7 })
    expect(
      number()
        .preprocess(input => (input === 'seven' ? 7 : input))
        .safeParse('seven')
    ).toMatchObject({ ok: true, value: 7 })

    const result = number().nullable().nonnullable('Number cannot be null').safeParse(null)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toEqual({ _errors: ['Number cannot be null'] })
    }
  })
})
