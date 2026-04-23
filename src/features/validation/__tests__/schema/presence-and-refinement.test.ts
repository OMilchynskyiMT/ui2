import { describe, expect, it } from 'vitest'

import { number, object, string } from '@/features/validation'

describe('presence and refinement semantics', () => {
  it('supports nullable and nonnullable semantics explicitly', () => {
    expect(string().nullable().safeParse(null)).toMatchObject({
      ok: true,
      value: null,
    })

    const result = string().nullable().nonnullable('Null is forbidden').safeParse(null)

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [],
          code: 'null.disallowed',
          message: 'Null is forbidden',
          input: null,
        },
      ])
    }
  })

  it('runs refinements against default factory values', () => {
    const result = string()
      .default(() => 'x')
      .min(2)
      .safeParse(undefined)

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [],
          code: 'string.min',
          message: 'Must be at least 2 characters',
          input: 'x',
        },
      ])
    }
  })

  it('lets object refinements emit nested path-specific issues', () => {
    const schema = object()
      .items({
        password: string(),
        confirm: string(),
      })
      .refine(
        (value, ctx) => {
          if (value.password !== value.confirm) {
            ctx.addIssue({
              path: ['confirm'],
              code: 'string.mismatch',
              message: 'Passwords do not match',
              input: value.confirm,
            })
          }
        },
        {
          message: 'Object invalid',
        }
      )

    const result = schema.safeParse({
      password: 'secret',
      confirm: 'different',
    })

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: ['confirm'],
          code: 'string.mismatch',
          message: 'Passwords do not match',
          input: 'different',
        },
      ])
      expect(result.errors).toEqual({
        confirm: ['Passwords do not match'],
      })
    }
  })

  it('supports form-oriented number coercion chains', () => {
    expect(number().emptyAsUndefined().coerce().optional().safeParse('')).toMatchObject({
      ok: true,
      value: undefined,
    })

    expect(number().emptyAsUndefined().coerce().optional().safeParse(' 42 ')).toMatchObject({
      ok: true,
      value: 42,
    })
  })
})
