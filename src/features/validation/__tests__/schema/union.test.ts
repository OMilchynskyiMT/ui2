import { describe, expect, it } from 'vitest'

import { number, string, union, type ValidationIssue } from '@/features/validation'

describe('union schema', () => {
  it('accepts the first matching member', () => {
    expect(union(string(), number()).safeParse('hello')).toMatchObject({
      ok: true,
      value: 'hello',
    })

    expect(union(string(), number()).safeParse(42)).toMatchObject({
      ok: true,
      value: 42,
    })
  })

  it('returns a single union issue when all members fail', () => {
    const result = union(string(), number()).safeParse(true)

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toHaveLength(1)
      expect(result.issues[0]).toMatchObject({
        path: [],
        code: 'union.no_match',
        message: 'Must match one of the allowed schemas',
        input: true,
      })
      expect(result.errors).toEqual({
        _errors: ['Must match one of the allowed schemas'],
      })

      const branches = result.issues[0]?.meta?.branches as { index: number; issues: ValidationIssue[] }[]

      expect(branches).toEqual([
        {
          index: 0,
          issues: [
            {
              path: [],
              code: 'string.type',
              message: 'Must be a string',
              input: true,
            },
          ],
        },
        {
          index: 1,
          issues: [
            {
              path: [],
              code: 'number.type',
              message: 'Must be a number',
              input: true,
            },
          ],
        },
      ])
    }
  })

  it('supports preprocess, optional, nullable, default factory, and refine flows', () => {
    expect(
      union(string(), number())
        .preprocess(input => (input === 'forty-two' ? 42 : input))
        .safeParse('forty-two')
    ).toMatchObject({
      ok: true,
      value: 42,
    })

    expect(union(string(), number()).optional().safeParse(undefined)).toMatchObject({ ok: true, value: undefined })
    expect(union(string(), number()).nullable().safeParse(null)).toMatchObject({ ok: true, value: null })
    expect(
      union(string(), number())
        .default(() => 'fallback')
        .safeParse(undefined)
    ).toMatchObject({ ok: true, value: 'fallback' })

    const refined = union(string(), number())
      .refine(value => typeof value === 'number', {
        code: 'union.number_only',
        message: 'Must resolve to a number',
      })
      .safeParse('hello')

    expect(refined.ok).toBe(false)
    if (!refined.ok) {
      expect(refined.errors).toEqual({ _errors: ['Must resolve to a number'] })
    }

    const nonnullable = union(string(), number()).nullable().nonnullable('Union cannot be null').safeParse(null)
    expect(nonnullable.ok).toBe(false)
    if (!nonnullable.ok) {
      expect(nonnullable.errors).toEqual({ _errors: ['Union cannot be null'] })
    }
  })
})
