import type { ValidationErrorBranch } from '../model/errors'
import type { ValidationIssue } from '../model/issues'

function isBranch(value: unknown): value is ValidationErrorBranch {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getOrCreateBranch(target: ValidationErrorBranch, key: string): ValidationErrorBranch {
  const current = target[key]

  if (isBranch(current)) return current

  const next: ValidationErrorBranch = {}
  target[key] = next
  return next
}

function pushNodeError(target: ValidationErrorBranch, message: string): void {
  target._errors ??= []
  target._errors.push(message)
}

function pushLeafError(target: ValidationErrorBranch, key: string, message: string): void {
  const current = target[key]

  if (Array.isArray(current)) {
    current.push(message)
    return
  }

  if (isBranch(current)) {
    current._errors ??= []
    current._errors.push(message)
    return
  }

  target[key] = [message]
}

export function toErrorTree(issues: ValidationIssue[]): ValidationErrorBranch {
  const root: ValidationErrorBranch = {}

  for (const issue of issues) {
    const { path, message } = issue

    if (path.length === 0) {
      pushNodeError(root, message)
      continue
    }

    let cursor = root

    for (let index = 0; index < path.length; index += 1) {
      const segment = String(path[index])
      const isLast = index === path.length - 1

      if (isLast) {
        pushLeafError(cursor, segment, message)
        continue
      }

      cursor = getOrCreateBranch(cursor, segment)
    }
  }

  return root
}
