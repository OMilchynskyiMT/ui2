import { json, jsonParseLinter } from '@codemirror/lang-json'
import type { Diagnostic } from '@codemirror/lint'
import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'

import type { CodeEditorLanguage } from '../editor.types'
import { javascriptDiagnostics, javascriptExtensions } from './javascript'
import { openVpn } from './openvpn'

// IMPORTANT: keep language semantics independent of the Vue component and its lifecycle
export const languageExtensions = (language: CodeEditorLanguage): Extension => {
  switch (language) {
    case 'js': {
      return javascriptExtensions()
    }
    case 'json': {
      return json()
    }
    case 'openvpn': {
      return openVpn()
    }
  }
}

const jsonDiagnostics = jsonParseLinter()

export const languageDiagnostics = (language: CodeEditorLanguage, view: EditorView): Diagnostic[] => {
  switch (language) {
    case 'js': {
      return javascriptDiagnostics(view)
    }
    case 'json': {
      return jsonDiagnostics(view)
    }
    case 'openvpn': {
      return []
    }
  }
}
