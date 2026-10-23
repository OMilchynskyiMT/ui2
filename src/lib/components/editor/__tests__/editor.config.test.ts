import { history, undoDepth } from '@codemirror/commands'
import { Compartment, EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'

import { languageExtensions } from '../languages'

describe('CodeMirror editor configuration', () => {
  it('changes language without rebuilding the document, selection or undo history', () => {
    const language = new Compartment()
    const state = EditorState.create({
      doc: 'const value = 1',
      extensions: [history(), language.of(languageExtensions('js'))],
    })
    const edited = state.update({ changes: { from: state.doc.length, insert: ';' }, selection: { anchor: 6 } }).state
    const reconfigured = edited.update({ effects: language.reconfigure(languageExtensions('json')) }).state

    expect(reconfigured.doc.toString()).toBe('const value = 1;')
    expect(reconfigured.selection.main.head).toBe(6)
    expect(undoDepth(reconfigured)).toBe(1)
  })
})
