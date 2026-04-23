import { describe, expect, it } from 'vitest'

import { string } from '@/features/validation'

describe('string schema', () => {
  it('accepts a valid string', () => {
    const result = string().safeParse('hello')

    expect(result).toMatchObject({
      ok: true,
      value: 'hello',
      issues: [],
      errors: {},
    })
  })

  it('rejects a non-string with a root issue', () => {
    const result = string().safeParse(123)

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [],
          code: 'string.type',
          message: 'Must be a string',
          input: 123,
        },
      ])
      expect(result.errors).toEqual({
        _errors: ['Must be a string'],
      })
    }
  })

  it('supports trim + emptyAsUndefined + optional for form-like inputs', () => {
    const result = string().trim().emptyAsUndefined().optional().safeParse('   ')

    expect(result).toMatchObject({
      ok: true,
      value: undefined,
      issues: [],
      errors: {},
    })
  })

  it('coerces primitive values to strings', () => {
    const result = string().coerce().safeParse(42)

    expect(result).toMatchObject({
      ok: true,
      value: '42',
    })
  })

  it('applies default factory when input is undefined', () => {
    let calls = 0
    const schema = string().default(() => {
      calls += 1
      return 'fallback'
    })

    const first = schema.safeParse(undefined)
    const second = schema.safeParse(undefined)

    expect(first).toMatchObject({ ok: true, value: 'fallback' })
    expect(second).toMatchObject({ ok: true, value: 'fallback' })
    expect(calls).toBe(2)
  })
})
