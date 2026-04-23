import type { ValidationPath } from './path'

export interface ValidationIssue {
  path: ValidationPath
  code: string
  message: string
  input?: unknown
  meta?: Record<string, unknown>
}
