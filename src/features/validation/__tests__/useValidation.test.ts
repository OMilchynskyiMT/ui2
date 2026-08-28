import { reactive } from 'vue'
import { expect, it } from 'vitest'

import { Schema, types, useValidation } from '../index'

it('validates the current source value', () => {
  const source = reactive({ name: '' })
  const schema = new Schema(types.object({ name: types.string() }))
  const validation = useValidation(schema, source)

  expect(validation.validated.value).toBe(false)
  expect(validation.valid.value).toBeUndefined()

  validation.validate()
  expect(validation.validated.value).toBe(true)
  expect(validation.valid.value).toBe(false)
  expect(validation.errors.value.name?.[0]).toBe('This field is required')

  source.name = 'Router'

  validation.validate()
  expect(validation.errors.value.name?.[0]).toBeUndefined()
})

it('returns all errors for the requested path', () => {
  const first = {
    code: 'first',
    message: 'First error',
    validate: (): boolean => false,
  }
  const second = {
    code: 'second',
    message: 'Second error',
    validate: (): boolean => false,
  }
  const source = reactive({ name: 'Router' })
  const schema = new Schema(types.object({ name: types.string(first, second) }))
  const validation = useValidation(schema, source)

  validation.validate()
  expect(validation.errors.value.name).toEqual(['First error', 'Second error'])
})

it('clears the current validation result', () => {
  const source = reactive({ name: '' })
  const schema = new Schema(types.object({ name: types.string() }))
  const validation = useValidation(schema, source)

  validation.validate()
  validation.clear()

  expect(validation.validated.value).toBe(false)
  expect(validation.valid.value).toBeUndefined()
  expect(validation.errors.value).toEqual({})
  expect(validation.issues.value).toEqual([])
})
