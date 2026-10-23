import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'

// editor chrome uses the application surface tokens; syntax roles are customizable CSS variables
const highlight = HighlightStyle.define([
  { tag: tags.comment, color: 'var(--code-comment)', fontStyle: 'italic' },
  { tag: tags.string, color: 'var(--code-string)' },
  { tag: tags.regexp, color: 'var(--code-regexp)' },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: 'var(--code-constant)' },
  { tag: tags.variableName, color: 'var(--code-variable)' },
  { tag: [tags.definitionKeyword, tags.modifier], color: 'var(--code-definition)' },
  { tag: [tags.keyword, tags.special(tags.brace)], color: 'var(--code-keyword)' },
  { tag: tags.operator, color: 'var(--code-operator)' },
  { tag: [tags.separator, tags.punctuation], color: 'var(--code-punctuation)' },
  {
    tag: [tags.definition(tags.propertyName), tags.function(tags.variableName)],
    color: 'var(--code-function)',
  },
  { tag: [tags.className, tags.definition(tags.typeName)], color: 'var(--code-type)', fontWeight: '600' },
  { tag: [tags.tagName, tags.typeName, tags.self, tags.labelName], color: 'var(--code-tag)' },
  { tag: tags.attributeName, color: 'var(--code-attribute)' },
  { tag: tags.angleBracket, color: 'var(--code-punctuation)' },
])

export const codeHighlighting: Extension = syntaxHighlighting(highlight)

// light/dark is an editor state property in CodeMirror
// retain the same view, document, history and selections when it changes
export const editorTheme = (isDark: boolean): Extension =>
  EditorView.theme(
    {
      '&': { color: 'var(--text-color-strong)', backgroundColor: 'var(--surface-card)' },
      '.cm-content': { caretColor: 'var(--text-color-strong)' },
      '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--text-color-strong)' },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: 'color-mix(in oklab, var(--brand-color) 26%, transparent)',
      },
      '.cm-activeLine': { backgroundColor: 'color-mix(in oklab, var(--text-color) 4%, transparent)' },
      '.cm-gutters': {
        backgroundColor: 'var(--surface-container-low)',
        color: 'var(--text-color-dimmed)',
        borderRight: '1px solid var(--divider-color)',
      },
      '.cm-activeLineGutter': { backgroundColor: 'color-mix(in oklab, var(--brand-color) 9%, transparent)' },
      '.cm-tooltip, .cm-panel': {
        backgroundColor: 'var(--surface-popover)',
        color: 'var(--text-color)',
        border: '1px solid var(--divider-color)',
        boxShadow: 'var(--shadow-md)',
      },
      '.cm-tooltip-autocomplete ul li[aria-selected]': {
        backgroundColor: 'var(--tone-primary-container)',
        color: 'var(--tone-primary-on-container)',
      },
      '.cm-searchMatch': { backgroundColor: 'color-mix(in oklab, var(--tone-warning) 22%, transparent)' },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: 'color-mix(in oklab, var(--tone-warning) 46%, transparent)',
      },
      '.cm-lintRange-error': { backgroundImage: 'none', textDecoration: 'underline wavy var(--tone-danger)' },
      '.cm-lintRange-warning': { backgroundImage: 'none', textDecoration: 'underline wavy var(--tone-warning)' },
    },
    { dark: isDark }
  )
