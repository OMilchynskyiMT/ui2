import type { Diagnostic } from '@codemirror/lint'
import type { Text } from '@codemirror/state'

import type { CodeEditorDiagnostic } from './editor.types'

const offset = (length: number, column: number | undefined): number =>
  column !== undefined && Number.isSafeInteger(column) ? Math.min(length, Math.max(0, column - 1)) : 0

// convert server/application line-column messages to valid document ranges
export const resolveDiagnostics = (document_: Text, messages: readonly CodeEditorDiagnostic[]): Diagnostic[] => {
  const result: Diagnostic[] = []

  for (const message of messages) {
    if (!Number.isSafeInteger(message.line) || message.line < 1 || message.line > document_.lines) continue

    const line = document_.line(message.line)
    const from = line.from + offset(line.length, message.column)
    let to = line.to

    if (message.endLine !== undefined && Number.isSafeInteger(message.endLine)) {
      const end = document_.line(Math.min(document_.lines, Math.max(message.line, message.endLine)))
      to = end.from + (message.endColumn === undefined ? end.length : offset(end.length, message.endColumn))
    } else if (message.endColumn !== undefined) {
      to = line.from + offset(line.length, message.endColumn)
    }

    result.push({
      from,
      to: Math.max(from, to),
      message: message.message,
      severity: message.severity,
      source: message.source,
    })
  }

  return result
}
