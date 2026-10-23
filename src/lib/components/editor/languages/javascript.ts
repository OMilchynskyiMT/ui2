import { javascript, javascriptLanguage, scopeCompletionSource } from '@codemirror/lang-javascript'
import { syntaxTree } from '@codemirror/language'
import type { Diagnostic } from '@codemirror/lint'
import type { EditorView } from '@codemirror/view'

// Provide the language's standard completion sources plus the globals actually
// available to user-authored ES code. Do not suggest Vue/app/browser internals.
const ecmaGlobals = {
  Object,
  Function,
  Boolean,
  Number,
  BigInt,
  String,
  Symbol,
  Date,
  RegExp,
  Array,
  Map,
  Set,
  WeakMap,
  WeakSet,
  Promise,
  Reflect,
  Proxy,
  JSON,
  Math,
  Intl,
  parseInt: Number.parseInt,
  parseFloat: Number.parseFloat,
  isNaN: Number.isNaN,
  isFinite: Number.isFinite,
  encodeURI,
  decodeURI,
  encodeURIComponent,
  decodeURIComponent,
}

export const javascriptExtensions = () => [
  javascript({ jsx: false, typescript: false }),
  javascriptLanguage.data.of({ autocomplete: scopeCompletionSource(ecmaGlobals) }),
]

export const javascriptDiagnostics = (view: EditorView): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []
  syntaxTree(view.state).iterate({
    enter(node) {
      if (!node.type.isError) return
      diagnostics.push({
        from: node.from,
        to: Math.max(node.from, node.to),
        severity: 'error',
        message: 'Syntax error',
        source: 'javascript',
      })
    },
  })
  return diagnostics
}
