import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'

import type { UseValidationReturn, ValidationPathInput } from './use-validation'

export function useFieldError<TOutput>(
  validation: UseValidationReturn<TOutput>,
  path: MaybeRefOrGetter<ValidationPathInput>
): ComputedRef<string[]> {
  return computed(() => validation.getError(toValue(path)))
}
