import { describe, expect, it } from 'vitest'

import { literal } from '@/features/validation'

describe('literal schema', () => {
  it('accepts an exact literal match', () => {
    const result = literal('draft').safeParse('draft')

    expect(result).toMatchObject({
      ok: true,
      value: 'draft',
      issues: [],
      errors: {},
    })
  })

  it('rejects a non-matching literal with expected metadata', () => {
    const result = literal('draft').safeParse('published')

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [],
          code: 'literal.value',
          message: 'Must be "draft"',
          input: 'published',
          meta: {
            expected: 'draft',
          },
        },
      ])
      expect(result.errors).toEqual({
        _errors: ['Must be "draft"'],
      })
    }
  })

  it('uses Object.is semantics for special numeric values', () => {
    const result = literal(Number.NaN).safeParse(Number.NaN)

    expect(result).toMatchObject({
      ok: true,
      value: Number.NaN,
    })
  })

  it('supports preprocess, optional, default factory, and refine', () => {
    expect(
      literal('draft')
        .preprocess(input => (input === 'DRAFT' ? 'draft' : input))
        .safeParse('DRAFT')
    ).toMatchObject({
      ok: true,
      value: 'draft',
    })
    expect(literal(true).optional().safeParse(undefined)).toMatchObject({ ok: true, value: undefined })
    expect(
      literal(true)
        .default(() => true)
        .safeParse(undefined)
    ).toMatchObject({ ok: true, value: true })

    const refined = literal('draft')
      .refine(value => value.length > 10, {
        code: 'literal.refined',
        message: 'Draft literal failed extra rule',
      })
      .safeParse('draft')

    expect(refined.ok).toBe(false)
    if (!refined.ok) {
      expect(refined.errors).toEqual({ _errors: ['Draft literal failed extra rule'] })
    }
  })
})
