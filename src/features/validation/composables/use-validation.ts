import { computed, type ComputedRef, type MaybeRefOrGetter, type Ref, ref, toValue, watch } from 'vue'

import type { ValidationErrorBranch } from '../model/errors'
import type { ValidationIssue } from '../model/issues'
import type { ValidationPath } from '../model/path'
import type { ValidationResult } from '../model/result'
import type { Schema } from '../schema/base'

export type ValidationPathInput = string | ValidationPath

export type UseValidationOptions = {
  validateOnChange?: boolean
}

export type UseValidationReturn<TOutput> = {
  issues: Ref<ValidationIssue[]>
  errors: Ref<ValidationErrorBranch>
  isValid: ComputedRef<boolean>

  validate: () => ValidationResult<TOutput>
  clear: () => void

  getIssues: (path?: ValidationPathInput) => ValidationIssue[]
  getError: (path: ValidationPathInput) => string[]
  getFirstError: (path: ValidationPathInput) => string | undefined
  hasError: (path?: ValidationPathInput) => boolean
}

function normalizePath(path: ValidationPathInput): ValidationPath {
  if (typeof path !== 'string') {
    return path
  }

  return path.split('.').map((segment: string) => {
    const numeric = Number(segment)

    return Number.isInteger(numeric) && String(numeric) === segment ? numeric : segment
  })
}

function isErrorBranch(value: unknown): value is ValidationErrorBranch {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getNodeAtPath(root: ValidationErrorBranch, path: ValidationPath): unknown {
  let cursor: unknown = root

  for (const segment of path) {
    if (!isErrorBranch(cursor)) return undefined
    cursor = cursor[String(segment)]
  }

  return cursor
}

function getMessagesFromNode(node: unknown): string[] {
  if (Array.isArray(node)) {
    return node.filter((value): value is string => typeof value === 'string')
  }

  if (isErrorBranch(node) && Array.isArray(node._errors)) {
    return node._errors.filter((value): value is string => typeof value === 'string')
  }

  return []
}

function pathStartsWith(full: ValidationPath, target: ValidationPath): boolean {
  if (target.length > full.length) return false

  for (const [index, segment] of target.entries()) {
    if (full[index] !== segment) return false
  }

  return true
}

export function useValidation<TInput = unknown, TOutput = TInput>(
  schema: MaybeRefOrGetter<Schema<TInput, TOutput>>,
  value: MaybeRefOrGetter<TInput>,
  options: UseValidationOptions = {}
): UseValidationReturn<TOutput> {
  const issues = ref<ValidationIssue[]>([])
  const errors = ref<ValidationErrorBranch>({})

  const validate = (): ValidationResult<TOutput> => {
    const result = toValue(schema).safeParse(toValue(value))

    issues.value = result.issues
    errors.value = result.errors

    return result
  }

  const clear = (): void => {
    issues.value = []
    errors.value = {}
  }

  const getIssues = (path?: ValidationPathInput): ValidationIssue[] => {
    if (path === undefined) return issues.value

    const normalized = normalizePath(path)

    return issues.value.filter(issue => pathStartsWith(issue.path, normalized))
  }

  const getError = (path: ValidationPathInput): string[] => {
    const normalized = normalizePath(path)
    return getMessagesFromNode(getNodeAtPath(errors.value, normalized))
  }

  const getFirstError = (path: ValidationPathInput): string | undefined => getError(path)[0]

  const hasError = (path?: ValidationPathInput): boolean => {
    if (path === undefined) return issues.value.length > 0
    return getIssues(path).length > 0
  }

  const isValid = computed(() => issues.value.length === 0)

  if (options.validateOnChange) {
    watch(
      () => toValue(value),
      () => {
        validate()
      },
      { deep: true }
    )
  }

  return {
    issues,
    errors,
    isValid,
    validate,
    clear,
    getIssues,
    getError,
    getFirstError,
    hasError,
  }
}
