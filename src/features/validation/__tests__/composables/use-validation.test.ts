import { nextTick, reactive, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { number, object, string, useValidation } from '@/features/validation'

describe('useValidation', () => {
  it('validates and exposes nested path helpers', () => {
    const form = reactive({
      user: {
        email: 123,
        age: 'oops',
      },
    })

    const schema = object().items({
      user: object().items({
        email: string(),
        age: number(),
      }),
    })

    const validation = useValidation(schema, form)
    const result = validation.validate()

    expect(result.ok).toBe(false)
    expect(validation.isValid.value).toBe(false)
    expect(validation.hasError()).toBe(true)
    expect(validation.hasError('user')).toBe(true)
    expect(validation.hasError('user.email')).toBe(true)
    expect(validation.getError('user.email')).toEqual(['Must be a string'])
    expect(validation.getFirstError(['user', 'age'])).toBe('Must be a number')
    expect(validation.getIssues('user')).toHaveLength(2)
  })

  it('revalidates on reactive object changes when validateOnChange is enabled', async () => {
    const form = reactive<{ user: { email: string | number } }>({
      user: {
        email: 123,
      },
    })

    const schema = object().items({
      user: object().items({
        email: string(),
      }),
    })

    const validation = useValidation(schema, form, { validateOnChange: true })

    form.user.email = 456
    await nextTick()

    expect(validation.hasError('user.email')).toBe(true)
    expect(validation.getFirstError('user.email')).toBe('Must be a string')

    form.user.email = 'ok'
    await nextTick()

    expect(validation.hasError('user.email')).toBe(false)
    expect(validation.isValid.value).toBe(true)
  })

  it('supports refs as the validated value source', async () => {
    const form = ref<{ name: string | number }>({
      name: 123,
    })

    const schema = object().items({
      name: string(),
    })

    const validation = useValidation(schema, form, { validateOnChange: true })

    form.value = { name: 456 }
    await nextTick()
    expect(validation.getFirstError('name')).toBe('Must be a string')

    form.value = { name: 'John Doe' }
    await nextTick()
    expect(validation.getFirstError('name')).toBeUndefined()
  })

  it('clear resets issues and errors', () => {
    const validation = useValidation(string(), 123)

    validation.validate()
    expect(validation.hasError()).toBe(true)

    validation.clear()
    expect(validation.hasError()).toBe(false)
    expect(validation.getError([])).toEqual([])
    expect(validation.errors.value).toEqual({})
  })
})
