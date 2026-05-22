import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'

import type { ValidationIssue } from '../model/issues'

import type { UseValidationReturn, ValidationPathInput } from './use-validation'

export function useFieldIssues<TOutput>(
  validation: UseValidationReturn<TOutput>,
  path: MaybeRefOrGetter<ValidationPathInput>
): ComputedRef<ValidationIssue[]> {
  return computed(() => validation.getIssues(toValue(path)))
}
