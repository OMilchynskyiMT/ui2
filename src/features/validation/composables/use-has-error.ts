import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'

import type { UseValidationReturn, ValidationPathInput } from './use-validation'

export function useHasError<TOutput>(
  validation: UseValidationReturn<TOutput>,
  path?: MaybeRefOrGetter<ValidationPathInput | undefined>
): ComputedRef<boolean> {
  return computed(() => {
    const resolvedPath = path === undefined ? undefined : toValue(path)
    return validation.hasError(resolvedPath)
  })
}
