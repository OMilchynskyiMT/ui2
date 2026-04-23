import { computed, reactive } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  object,
  string,
  useFieldError,
  useFieldFirstError,
  useFieldIssues,
  useHasError,
  useValidation,
} from '@/features/validation'

describe('field helper composables', () => {
  it('reactively project field errors and issues from validation state', () => {
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

    const validation = useValidation(schema, form)
    validation.validate()

    const path = computed(() => ['user', 'email'] as const)
    const fieldErrors = useFieldError(validation, path)
    const fieldFirstError = useFieldFirstError(validation, path)
    const fieldIssues = useFieldIssues(validation, path)
    const fieldHasError = useHasError(validation, path)
    const formHasError = useHasError(validation)

    expect(fieldErrors.value).toEqual(['Must be a string'])
    expect(fieldFirstError.value).toBe('Must be a string')
    expect(fieldIssues.value).toEqual([
      {
        path: ['user', 'email'],
        code: 'string.type',
        message: 'Must be a string',
        input: 123,
      },
    ])
    expect(fieldHasError.value).toBe(true)
    expect(formHasError.value).toBe(true)

    form.user.email = 'ok'
    validation.validate()

    expect(fieldErrors.value).toEqual([])
    expect(fieldFirstError.value).toBeUndefined()
    expect(fieldIssues.value).toEqual([])
    expect(fieldHasError.value).toBe(false)
    expect(formHasError.value).toBe(false)
  })
})
