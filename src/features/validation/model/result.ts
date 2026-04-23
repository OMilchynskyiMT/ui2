import type { ValidationErrorBranch } from './errors'
import type { ValidationIssue } from './issues'

export interface ValidationSuccess<T> {
  ok: true
  value: T
  issues: []
  errors: ValidationErrorBranch
}

export interface ValidationFailure {
  ok: false
  issues: ValidationIssue[]
  errors: ValidationErrorBranch
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure
