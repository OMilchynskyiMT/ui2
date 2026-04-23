import { describe, expect, it } from 'vitest'

import { boolean } from '@/features/validation'

describe('boolean schema', () => {
  it('coerces common string and numeric boolean inputs', () => {
    expect(boolean().coerce().safeParse('true')).toMatchObject({ ok: true, value: true })
    expect(boolean().coerce().safeParse('off')).toMatchObject({ ok: true, value: false })
    expect(boolean().coerce().safeParse(1)).toMatchObject({ ok: true, value: true })
    expect(boolean().coerce().safeParse(0)).toMatchObject({ ok: true, value: false })
  })

  it('rejects unsupported boolean coercions', () => {
    const result = boolean().coerce().safeParse('maybe')

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [],
          code: 'boolean.type',
          message: 'Must be a boolean',
          input: 'maybe',
        },
      ])
      expect(result.errors).toEqual({
        _errors: ['Must be a boolean'],
      })
    }
  })

  it('supports optional, nullable, nonnullable, refine, and default factory flows', () => {
    expect(boolean().optional().safeParse(undefined)).toMatchObject({ ok: true, value: undefined })
    expect(boolean().nullable().safeParse(null)).toMatchObject({ ok: true, value: null })
    expect(
      boolean()
        .default(() => true)
        .safeParse(undefined)
    ).toMatchObject({ ok: true, value: true })

    const nonnullable = boolean().nullable().nonnullable('Null is forbidden').safeParse(null)
    expect(nonnullable.ok).toBe(false)
    if (!nonnullable.ok) {
      expect(nonnullable.errors).toEqual({ _errors: ['Null is forbidden'] })
    }

    const refined = boolean()
      .refine(value => value, {
        code: 'boolean.true',
        message: 'Must be true',
      })
      .safeParse(false)

    expect(refined.ok).toBe(false)
    if (!refined.ok) {
      expect(refined.errors).toEqual({ _errors: ['Must be true'] })
    }
  })
})
