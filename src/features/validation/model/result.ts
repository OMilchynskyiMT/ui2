import type { ValidationErrorBranch } from './errors'
import type { ValidationIssue } from './issues'

export type ValidationSuccess<T> = {
  ok: true
  value: T
  issues: []
  errors: ValidationErrorBranch
}

export type ValidationFailure = {
  ok: false
  issues: ValidationIssue[]
  errors: ValidationErrorBranch
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure
