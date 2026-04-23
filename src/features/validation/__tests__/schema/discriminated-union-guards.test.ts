import { describe, expect, it } from 'vitest'

import { discriminatedUnion, literal, number, object, string } from '@/features/validation'

describe('discriminatedUnion guards', () => {
  it('rejects invalid discriminator values on the discriminator path', () => {
    const schema = discriminatedUnion(
      'kind',
      object().items({
        kind: literal('email'),
        value: string(),
      }),
      object().items({
        kind: literal('count'),
        value: number(),
      })
    )

    const result = schema.safeParse({
      kind: 'other',
      value: 'x',
    })

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues).toEqual([
        {
          path: ['kind'],
          code: 'discriminated_union.discriminator.invalid',
          message: 'Discriminator "kind" must be one of: "email", "count"',
          input: 'other',
          meta: {
            discriminator: 'kind',
            expected: ['email', 'count'],
          },
        },
      ])
      expect(result.errors).toEqual({
        kind: ['Discriminator "kind" must be one of: "email", "count"'],
      })
    }
  })

  it('throws for duplicate discriminator values during schema construction', () => {
    expect(() =>
      discriminatedUnion(
        'kind',
        object().items({
          kind: literal('email'),
          value: string(),
        }),
        object().items({
          kind: literal('email'),
          value: number(),
        })
      )
    ).toThrow(TypeError)
  })

  it('throws for members that do not define the discriminator as literal()', () => {
    expect(() =>
      discriminatedUnion(
        'kind',
        object().items({
          kind: string(),
          value: string(),
        }) as never,
        object().items({
          kind: literal('count'),
          value: number(),
        })
      )
    ).toThrow(TypeError)
  })
})
