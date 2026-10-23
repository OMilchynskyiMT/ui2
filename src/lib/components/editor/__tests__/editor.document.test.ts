import { history, undoDepth } from '@codemirror/commands'
import { EditorState, Transaction } from '@codemirror/state'
import { describe, expect, it } from 'vitest'

import { documentChange } from '../editor.document'

describe('controlled editor model synchronization', () => {
  it('does nothing when values already match', () => {
    expect(documentChange('same', 'same')).toBeNull()
  })

  it('changes only the edited region rather than replacing the entire document', () => {
    expect(documentChange('hello world!', 'hello CodeMirror!')).toEqual({ from: 6, to: 11, insert: 'CodeMirror' })
    expect(documentChange('abde', 'abcde')).toEqual({ from: 2, to: 2, insert: 'c' })
    expect(documentChange('abcde', 'abe')).toEqual({ from: 2, to: 4, insert: '' })
  })

  it('handles empty documents and total replacement', () => {
    expect(documentChange('', 'hello')).toEqual({ from: 0, to: 0, insert: 'hello' })
    expect(documentChange('old', '')).toEqual({ from: 0, to: 3, insert: '' })
    expect(documentChange('xyz', 'abc')).toEqual({ from: 0, to: 3, insert: 'abc' })
  })

  it('preserves the undo depth and maps the selection through external changes', () => {
    const initial = EditorState.create({ doc: 'alpha beta', extensions: [history()] })
    const typed = initial.update({ changes: { from: 10, insert: '!' }, selection: { anchor: 11 } }).state
    const changes = documentChange(typed.doc.toString(), 'alpha BETA!')

    if (changes === null) throw new Error('Expected a document change')
    const synced = typed.update({ changes, annotations: Transaction.addToHistory.of(false) }).state

    expect(synced.doc.toString()).toBe('alpha BETA!')
    expect(synced.selection.main.head).toBe(11)
    expect(undoDepth(synced)).toBe(1)
  })

  it('uses valid UTF-16 offsets when replacing Unicode text', () => {
    const current = 'const icon = "🌙";'
    const next = 'const icon = "🌞";'
    const changes = documentChange(current, next)
    if (changes === null) throw new Error('Expected a document change')
    expect(current.slice(0, changes.from) + changes.insert + current.slice(changes.to)).toBe(next)
  })
})
