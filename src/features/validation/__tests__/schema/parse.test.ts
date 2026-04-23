import { describe, expect, it } from 'vitest'

import { string, ValidationError } from '@/features/validation'

describe('parse', () => {
  it('throws ValidationError for base schemas', () => {
    expect(() => string().parse(123)).toThrow(ValidationError)

    try {
      string().parse(123)
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)

      const validationError = error as ValidationError
      expect(validationError.issues).toEqual([
        {
          path: [],
          code: 'string.type',
          message: 'Must be a string',
          input: 123,
        },
      ])
      expect(validationError.errors).toEqual({
        _errors: ['Must be a string'],
      })
    }
  })

  it('throws ValidationError for transformed schemas too', () => {
    const schema = string().transform(() => {
      throw new Error('Boom')
    })

    expect(() => schema.parse('ok')).toThrow(ValidationError)

    try {
      schema.parse('ok')
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)

      const validationError = error as ValidationError
      expect(validationError.issues).toEqual([
        {
          path: [],
          code: 'transform.failed',
          message: 'Boom',
          input: 'ok',
        },
      ])
      expect(validationError.errors).toEqual({
        _errors: ['Boom'],
      })
    }
  })
})
