import { describe, expect, it } from 'vitest'

import { number, object, string } from '@/features/validation'

describe('object schema', () => {
  it('returns nested issues and nested error tree for invalid fields', () => {
    const schema = object().items({
      user: object().items({
        email: string(),
        age: number(),
      }),
    })

    const result = schema.safeParse({
      user: {
        email: 123,
      },
    })

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: ['user', 'email'],
          code: 'string.type',
          message: 'Must be a string',
          input: 123,
        },
        {
          path: ['user', 'age'],
          code: 'required',
          message: 'Required',
          input: undefined,
        },
      ])

      expect(result.errors).toEqual({
        user: {
          email: ['Must be a string'],
          age: ['Required'],
        },
      })
    }
  })

  it('strips unknown keys by default', () => {
    const schema = object().items({
      name: string(),
    })

    const result = schema.safeParse({
      name: 'Alice',
      role: 'admin',
    })

    expect(result).toMatchObject({
      ok: true,
      value: {
        name: 'Alice',
      },
    })
  })

  it('allows unknown keys when configured', () => {
    const schema = object()
      .items({
        name: string(),
      })
      .allowUnknown()

    const result = schema.safeParse({
      name: 'Alice',
      role: 'admin',
    })

    expect(result).toMatchObject({
      ok: true,
      value: {
        name: 'Alice',
        role: 'admin',
      },
    })
  })

  it('reports unknown keys in exact mode', () => {
    const schema = object()
      .items({
        name: string(),
      })
      .exact()

    const result = schema.safeParse({
      name: 'Alice',
      role: 'admin',
    })

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: ['role'],
          code: 'object.unknown',
          message: 'Unknown key',
          input: 'admin',
        },
      ])
      expect(result.errors).toEqual({
        role: ['Unknown key'],
      })
    }
  })

  it('uses default factory per parse call for mutable values', () => {
    const schema = object().items({
      tags: object()
        .items({})
        .default(() => ({ created: true })),
    })

    const first = schema.safeParse({})
    const second = schema.safeParse({})

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)

    if (first.ok && second.ok) {
      const firstTags = first.value.tags as { created: boolean; extra?: boolean }
      const secondTags = second.value.tags as { created: boolean; extra?: boolean }

      firstTags.extra = true

      expect(secondTags).toEqual({ created: true })
    }
  })

  it('supports preprocess, optionality, nullable flows, and object-level refinements', () => {
    expect(
      object()
        .preprocess(input => (input === 'wrapped' ? { name: 'Wrapped' } : input))
        .items({ name: string() })
        .safeParse('wrapped')
    ).toMatchObject({
      ok: true,
      value: { name: 'Wrapped' },
    })

    expect(object().items({ name: string() }).optional().safeParse(undefined)).toMatchObject({
      ok: true,
      value: undefined,
    })
    expect(object().items({ name: string() }).nullable().safeParse(null)).toMatchObject({ ok: true, value: null })

    const nonnullable = object()
      .items({ name: string() })
      .nullable()
      .nonnullable('Object cannot be null')
      .safeParse(null)
    expect(nonnullable.ok).toBe(false)
    if (!nonnullable.ok) {
      expect(nonnullable.errors).toEqual({ _errors: ['Object cannot be null'] })
    }

    const refined = object()
      .items({
        password: string(),
        confirm: string(),
      })
      .refine(
        (value, context) => {
          if (value.password !== value.confirm) {
            context.addIssue({
              path: ['confirm'],
              code: 'object.mismatch',
              message: 'Passwords do not match',
            })
          }
        },
        { message: 'unused fallback' }
      )
      .safeParse({
        password: 'a',
        confirm: 'b',
      })

    expect(refined.ok).toBe(false)
    if (!refined.ok) {
      expect(refined.errors).toEqual({
        confirm: ['Passwords do not match'],
      })
    }

    const notObject = object().items({ name: string() }).safeParse(['x'])
    expect(notObject.ok).toBe(false)
    if (!notObject.ok) {
      expect(notObject.errors).toEqual({ _errors: ['Must be an object'] })
    }
  })
})
