import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'

import { resolveDiagnostics } from '../editor.diagnostics'

const document = EditorState.create({ doc: 'first line\nsecond line\n' }).doc

describe('external code editor diagnostics', () => {
  it('maps one-based lines and columns to CodeMirror offsets', () => {
    expect(
      resolveDiagnostics(document, [
        { line: 2, column: 2, endColumn: 5, severity: 'warning', message: 'bad value' },
        { line: 1, severity: 'error', message: 'bad line' },
      ])
    ).toMatchObject([
      { from: 12, to: 15, severity: 'warning', message: 'bad value' },
      { from: 0, to: 10, severity: 'error', message: 'bad line' },
    ])
  })

  it('clamps invalid columns and omits out-of-range line numbers', () => {
    expect(
      resolveDiagnostics(document, [
        { line: 0, severity: 'error', message: 'invalid' },
        { line: 99, severity: 'error', message: 'invalid' },
        { line: 1, column: 999, endColumn: 1, severity: 'info', message: 'bounded' },
        { line: 3, severity: 'hint', message: 'empty line' },
      ])
    ).toMatchObject([
      { from: 10, to: 10 },
      { from: 23, to: 23 },
    ])
  })

  it('supports multiline spans without reversing ranges', () => {
    expect(
      resolveDiagnostics(document, [
        { line: 1, column: 4, endLine: 2, endColumn: 3, severity: 'error', message: 'span' },
      ])
    ).toMatchObject([{ from: 3, to: 13 }])
  })
})
