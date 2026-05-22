import type { ValidationPath } from './path'

export type ValidationIssue = {
  path: ValidationPath
  code: string
  message: string
  input?: unknown
  meta?: Record<string, unknown>
}
