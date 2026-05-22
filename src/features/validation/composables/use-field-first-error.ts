import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'

import type { UseValidationReturn, ValidationPathInput } from './use-validation'

export function useFieldFirstError<TOutput>(
  validation: UseValidationReturn<TOutput>,
  path: MaybeRefOrGetter<ValidationPathInput>
): ComputedRef<string | undefined> {
  return computed(() => validation.getFirstError(toValue(path)))
}
