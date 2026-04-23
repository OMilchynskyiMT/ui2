import { describe, expect, it } from 'vitest'

import { string } from '@/features/validation'

describe('effects schema', () => {
  it('transforms parsed values to a new output type', () => {
    const result = string()
      .trim()
      .transform(value => value.length)
      .safeParse('  hello  ')

    expect(result).toMatchObject({
      ok: true,
      value: 5,
      issues: [],
      errors: {},
    })
  })

  it('refines transformed values', () => {
    const result = string()
      .trim()
      .transform(value => value.length)
      .refine(value => value >= 3, {
        code: 'length.min',
        message: 'Must be at least 3 characters after trim',
      })
      .safeParse(' x ')

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [],
          code: 'length.min',
          message: 'Must be at least 3 characters after trim',
          input: 1,
        },
      ])
      expect(result.errors).toEqual({
        _errors: ['Must be at least 3 characters after trim'],
      })
    }
  })

  it('reports transform failures as validation issues', () => {
    const result = string()
      .transform(() => {
        throw new Error('Transform exploded')
      })
      .safeParse('hello')

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [],
          code: 'transform.failed',
          message: 'Transform exploded',
          input: 'hello',
        },
      ])
      expect(result.errors).toEqual({
        _errors: ['Transform exploded'],
      })
    }
  })

  it('supports chained effects transform and use()', () => {
    const result = string()
      .transform(value => value.length)
      .use(schema => schema.transform(value => value * 2))
      .safeParse('abcd')

    expect(result).toMatchObject({ ok: true, value: 8 })
  })
})
