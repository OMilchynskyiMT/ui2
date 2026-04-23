import { describe, expect, it } from 'vitest'

import { discriminatedUnion, literal, number, object, string } from '@/features/validation'

describe('discriminatedUnion', () => {
  const schema = discriminatedUnion(
    'kind',
    object().items({
      kind: literal('email'),
      value: string().trim(),
    }),
    object().items({
      kind: literal('count'),
      value: number().min(0),
    })
  )

  it('routes to the matched branch and returns branch-specific errors', () => {
    const result = schema.safeParse({
      kind: 'email',
      value: 123,
    })

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: ['value'],
          code: 'string.type',
          message: 'Must be a string',
          input: 123,
        },
      ])
      expect(result.errors).toEqual({
        value: ['Must be a string'],
      })
    }
  })

  it('reports missing discriminator on the discriminator path', () => {
    const result = schema.safeParse({ value: 'hello' })

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: ['kind'],
          code: 'discriminated_union.discriminator.required',
          message: 'Discriminator "kind" is required',
          input: undefined,
          meta: {
            discriminator: 'kind',
            expected: ['email', 'count'],
          },
        },
      ])
      expect(result.errors).toEqual({
        kind: ['Discriminator "kind" is required'],
      })
    }
  })

  it('supports preprocess, optional, nullable, default factory, and refine flows', () => {
    expect(
      schema.preprocess(input => (input === 'preset' ? { kind: 'count', value: 2 } : input)).safeParse('preset')
    ).toMatchObject({
      ok: true,
      value: { kind: 'count', value: 2 },
    })

    expect(schema.optional().safeParse(undefined)).toMatchObject({ ok: true, value: undefined })
    expect(schema.nullable().safeParse(null)).toMatchObject({ ok: true, value: null })
    expect(schema.default(() => ({ kind: 'email', value: 'fallback' })).safeParse(undefined)).toMatchObject({
      ok: true,
      value: { kind: 'email', value: 'fallback' },
    })

    const refined = schema
      .refine(value => value.kind === 'count', {
        code: 'discriminated_union.kind',
        message: 'Must resolve to count variant',
      })
      .safeParse({ kind: 'email', value: 'x' })

    expect(refined.ok).toBe(false)
    if (!refined.ok) {
      expect(refined.errors).toEqual({ _errors: ['Must resolve to count variant'] })
    }

    const nonnullable = schema.nullable().nonnullable('Discriminated union cannot be null').safeParse(null)
    expect(nonnullable.ok).toBe(false)
    if (!nonnullable.ok) {
      expect(nonnullable.errors).toEqual({ _errors: ['Discriminated union cannot be null'] })
    }
  })

  it('rejects non-object inputs before discriminator routing', () => {
    const result = schema.safeParse('oops')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toEqual({ _errors: ['Must be an object'] })
    }
  })
})
