import { describe, expect, it } from 'vitest'

import {
  boolean,
  defineBooleanExtension,
  defineExtension,
  defineNumberExtension,
  defineStringExtension,
  number,
  string,
  type StringSchema,
} from '@/features/validation'

const email = defineExtension<StringSchema, [message?: string]>(
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

  it('build string extensions', () => {
    const hex = defineStringExtension<[message?: string]>(
      (message = 'Invalid hex color') =>
        schema =>
          schema.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, message)
    )
    expect(string().trim().use(hex()).safeParse('#fff')).toMatchObject({
      ok: true,
      value: '#fff',
    })
  })

  it('build number extension', () => {
    const birthYear = defineNumberExtension<[message?: string]>(
      (message = 'Invalid birth year') =>
        schema =>
          schema.min(1900, message).max(new Date().getFullYear(), message)
    )
    expect(number().coerce().use(birthYear()).safeParse('2000')).toMatchObject({
      ok: true,
      value: 2000,
    })
  })

  it('build boolean extension', () => {
    const isEvening = defineBooleanExtension<[message?: string]>(
      (message = 'Invalid evening flag') =>
        schema =>
          schema.refine(value => value === true, { message })
    )
    expect(boolean().use(isEvening()).safeParse(true)).toMatchObject({
      ok: true,
      value: true,
    })
  })
})
