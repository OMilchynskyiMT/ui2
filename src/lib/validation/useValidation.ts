import { computed, type MaybeRefOrGetter, shallowRef, toValue, watch } from 'vue'

import type { ValidationErrors, ValidationIssue, ValidationResult } from './types'

export type ValidationSchema<T extends object> = Readonly<{
  validate: (data: unknown) => ValidationResult<T>
}>

export const useValidation = <T extends object>(schema: ValidationSchema<T>, source: MaybeRefOrGetter<T>) => {
  const result = shallowRef<ValidationResult<T>>()

  const validated = computed(() => result.value !== undefined)
  const valid = computed(() => result.value?.valid)
  const errors = computed<ValidationErrors<T>>(() => result.value?.errors ?? {})
  const issues = computed<readonly ValidationIssue[]>(() => result.value?.issues ?? [])

  const validate = (): ValidationResult<T> => {
    const validationResult = schema.validate(toValue(source))
    result.value = validationResult
    return validationResult
  }

  watch(
    () => toValue(source),
    () => {
      if (result.value !== undefined) validate()
    },
    { deep: true, flush: 'sync' }
  )

  const clear = (): void => {
    result.value = undefined
  }

  return {
    validated,
    valid,
    errors,
    issues,
    validate,
    clear,
  }
}
