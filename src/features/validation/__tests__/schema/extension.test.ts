import { describe, expect, it } from 'vitest'

import { defineExtension, string, type StringSchema } from '@/features/validation'

const email = defineExtension<StringSchema<string>, [message?: string]>(
  (message = 'Invalid email') =>
    schema =>
      schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message)
)

describe('defineExtension', () => {
  it('builds reusable schema extensions', () => {
    const schema = string().trim().use(email())

    expect(schema.safeParse(' user@example.com ')).toMatchObject({
      ok: true,
      value: 'user@example.com',
    })

    const result = schema.safeParse('not-an-email')

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: [],
          code: 'string.pattern',
          message: 'Invalid email',
          input: 'not-an-email',
        },
      ])
    }
  })
})
