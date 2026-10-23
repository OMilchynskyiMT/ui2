import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'

export type CodeEditorLanguage = 'js' | 'json' | 'openvpn'

// positions are one-based; endColumn, when present, is exclusive
export type CodeEditorDiagnostic = {
  line: number
  column?: number
  endLine?: number
  endColumn?: number
  message: string
  severity: 'error' | 'warning' | 'info' | 'hint'
  source?: string
}

export type UiCodeEditorProperties = {
  language?: CodeEditorLanguage
  readonly?: boolean
  disabled?: boolean
  lint?: boolean
  wrap?: boolean
  tabSize?: number
  label?: string
  expandable?: boolean
  extensions?: Extension
  diagnostics?: readonly CodeEditorDiagnostic[]
}

export type UiCodeEditorExpose = {
  focus: () => void
  getView: () => EditorView | null
  openSearch: () => void
  scrollToLine: (line: number) => void
}
