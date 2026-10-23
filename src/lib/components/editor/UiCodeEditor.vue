<template>
  <div v-if="expanded" :style="{ blockSize: `${inlineHeight}px` }" aria-hidden="true" class="editor-placeholder" />

  <Teleport :disabled="!expanded" :to="expandedTarget ?? '#modals'">
    <section
      ref="container"
      v-bind="attributes"
      :aria-label="label"
      :class="{ expanded, disabled }"
      class="code-editor"
    >
      <UiInline class="toolbar" gap="var(--space-md)" justify="between">
        <span class="language-label">{{ languageLabels[language] }}</span>
        <UiInline gap="var(--space-xs)">
          <UiButton
            :disabled="disabled"
            :icon="SearchIcon"
            aria-label="Find or replace"
            layout="icon"
            size="small"
            title="Find or replace (Ctrl+F)"
            tone="neutral"
            variant="text"
            @click="openSearch"
          />
          <UiButton
            v-if="expandable || expanded"
            ref="expandButton"
            :aria-expanded="expanded"
            :aria-label="expanded ? 'Exit fullscreen editor' : 'Expand editor'"
            :disabled="disabled"
            :icon="expanded ? Minimize2Icon : Maximize2Icon"
            :title="expanded ? 'Exit fullscreen' : 'Expand editor'"
            aria-haspopup="dialog"
            layout="icon"
            size="small"
            tone="neutral"
            variant="text"
            @click="toggleExpanded"
          />
        </UiInline>
      </UiInline>
      <div ref="editorHost" class="editor-host" />
      <UiInline aria-hidden="true" class="status-bar" gap="var(--space-md)" justify="end">
        <UiBadge v-if="readonly" size="small" tone="neutral">Read-only</UiBadge>
        <UiBadge v-if="disabled" size="small" tone="warning">Disabled</UiBadge>
        <span class="cursor-position">Ln {{ cursorLine }}, Col {{ cursorColumn }}</span>
        <span>Spaces: {{ normalizedIndent }}</span>
      </UiInline>
    </section>
  </Teleport>

  <UiDialog
    v-if="expandable || expanded"
    ref="expandedDialog"
    :aria-label="label"
    class="code-editor-dialog"
    fullscreen
    @close="onExpandedClosed"
  >
    <div ref="expandedTarget" class="expanded-target" />
  </UiDialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useAttrs, useTemplateRef, watch } from 'vue'
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, indentUnit } from '@codemirror/language'
import { forceLinting, linter, lintGutter, lintKeymap } from '@codemirror/lint'
import {
  closeSearchPanel,
  highlightSelectionMatches,
  openSearchPanel,
  replaceAll,
  replaceNext,
  search,
  searchKeymap,
} from '@codemirror/search'
import { Compartment, EditorState, type Extension, Transaction } from '@codemirror/state'
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view'
import { Maximize2Icon, Minimize2Icon, SearchIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiDialog, { type Exposed as DialogExposed } from '@/lib/components/dialog/UiDialog.vue'
import UiInline from '@/lib/components/layout/UiInline.vue'

import UiBadge from '../UiBadge.vue'
import { resolveDiagnostics } from './editor.diagnostics'
import { documentChange } from './editor.document'
import { codeHighlighting, editorTheme } from './editor.theme'
import type { CodeEditorLanguage, UiCodeEditorExpose, UiCodeEditorProperties } from './editor.types'
import { languageDiagnostics, languageExtensions } from './languages'

// NOTE: the view is owned by this component. CodeMirror state and history are never
// recreated for prop changes, scheme changes or fullscreen transitions
defineOptions({ inheritAttrs: false })
const attributes = useAttrs()

const {
  language = 'js',
  readonly = false,
  disabled = false,
  lint = true,
  wrap = false,
  tabSize = 2,
  label = 'Code editor',
  expandable = true,
  extensions = [],
  diagnostics = [],
} = defineProps<UiCodeEditorProperties>()

const model = defineModel<string>({ required: true })
const emit = defineEmits<{ focus: []; blur: [] }>()
const languageLabels: Record<CodeEditorLanguage, string> = { js: 'JavaScript', json: 'JSON', openvpn: 'OpenVPN' }
// resolve the effective inherited color scheme without coupling the library
// to the application persistence or theme-management composables
const dark = ref(false)
let colorObserver: MutationObserver | undefined
let colorMedia: MediaQueryList | undefined
const updateColorMode = (): void => {
  if (!container.value) return
  const mode = getComputedStyle(container.value).colorScheme
  dark.value = mode === 'dark' || (mode.includes('dark') && mode.includes('light') && !!colorMedia?.matches)
}
const container = useTemplateRef<HTMLElement>('container')
const editorHost = useTemplateRef<HTMLElement>('editorHost')
const expandedDialog = useTemplateRef<DialogExposed>('expandedDialog')
const expandedTarget = useTemplateRef<HTMLDivElement>('expandedTarget')
const expandButton = useTemplateRef<{ $el: HTMLButtonElement }>('expandButton')
const expanded = ref(false)
const inlineHeight = ref(0)
const cursorLine = ref(1)
const cursorColumn = ref(1)
const normalizedIndent = computed(() => (Number.isFinite(tabSize) ? Math.max(1, Math.min(8, Math.round(tabSize))) : 2))
const view = shallowRef<EditorView | null>(null)

const languageConfig = new Compartment()
const themeConfig = new Compartment()
const readonlyConfig = new Compartment()
const wrappingConfig = new Compartment()
const indentConfig = new Compartment()
const customConfig = new Compartment()
const contentConfig = new Compartment()

const indentExtensions = (size: number): Extension => [EditorState.tabSize.of(size), indentUnit.of(' '.repeat(size))]

const editableExtensions = (): Extension => [
  EditorState.readOnly.of(readonly || disabled),
  EditorView.editable.of(!readonly && !disabled),
]
const contentExtensions = (): Extension =>
  EditorView.contentAttributes.of({
    'aria-label': label,
    'aria-disabled': String(disabled),
    'aria-readonly': String(readonly),
    tabindex: disabled ? '-1' : '0',
  })
const focus = (): void => {
  if (!disabled) view.value?.focus()
}
const openSearch = (): void => {
  if (!disabled && view.value) openSearchPanel(view.value)
}
const scrollToLine = (lineNumber: number): void => {
  const target = view.value
  if (!target || !Number.isSafeInteger(lineNumber) || lineNumber < 1 || lineNumber > target.state.doc.lines) return
  const position = target.state.doc.line(lineNumber).from
  target.dispatch({ effects: EditorView.scrollIntoView(position, { y: 'center' }) })
}

defineExpose<UiCodeEditorExpose>({ focus, getView: () => view.value, openSearch, scrollToLine })

const toggleExpanded = async (): Promise<void> => {
  if (expanded.value) {
    expandedDialog.value?.close()
    return
  }
  if (!expandedTarget.value || !expandedDialog.value) return
  inlineHeight.value = container.value?.getBoundingClientRect().height ?? 0
  expanded.value = true
  await nextTick()
  expandedDialog.value?.show()
  view.value?.requestMeasure()
  expandButton.value?.$el.focus({ preventScroll: true })
}

const onExpandedClosed = async (): Promise<void> => {
  expanded.value = false
  await nextTick()
  view.value?.requestMeasure()
  expandButton.value?.$el.focus({ preventScroll: true })
}

watch(
  () => expandable,
  enabled => {
    if (!enabled && expanded.value) expandedDialog.value?.close()
  }
)

onMounted(() => {
  if (!editorHost.value) return
  colorMedia = matchMedia('(prefers-color-scheme: dark)')
  colorMedia.addEventListener('change', updateColorMode)
  colorObserver = new MutationObserver(updateColorMode)
  colorObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-scheme', 'style', 'class'],
  })
  updateColorMode()
  const state = EditorState.create({
    doc: model.value,
    extensions: [
      EditorView.updateListener.of(update => {
        const head = update.state.selection.main.head
        const line = update.state.doc.lineAt(head)
        cursorLine.value = line.number
        cursorColumn.value = head - line.from + 1
        if (update.docChanged) model.value = update.state.doc.toString()
        if (update.focusChanged) {
          if (update.view.hasFocus) emit('focus')
          else emit('blur')
        }
      }),
      history(),
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      drawSelection(),
      EditorState.allowMultipleSelections.of(true),
      dropCursor(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      foldGutter(),
      highlightActiveLine(),
      rectangularSelection(),
      highlightSelectionMatches(),
      search(),
      autocompletion(),
      lintGutter(),
      linter(
        target => [
          ...(lint ? languageDiagnostics(language, target) : []),
          ...resolveDiagnostics(target.state.doc, diagnostics),
        ],
        { delay: 300 }
      ),
      keymap.of([
        ...closeBracketsKeymap,
        ...completionKeymap,
        ...searchKeymap,
        { key: 'Mod-Alt-r', run: replaceNext },
        { key: 'Mod-Alt-Shift-r', run: replaceAll },
        ...lintKeymap,
        ...foldKeymap,
        indentWithTab,
        ...defaultKeymap,
        ...historyKeymap,
      ]),
      codeHighlighting,
      languageConfig.of(languageExtensions(language)),
      themeConfig.of(editorTheme(dark.value)),
      readonlyConfig.of(editableExtensions()),
      wrappingConfig.of(wrap ? EditorView.lineWrapping : []),
      indentConfig.of(indentExtensions(normalizedIndent.value)),
      customConfig.of(extensions),
      contentConfig.of(contentExtensions()),
    ],
  })
  view.value = new EditorView({ state, parent: editorHost.value })
})

// External updates are controlled-value synchronization, not user edits. Preserve
// undo history and avoid a model feedback loop; change mapping retains selections.
watch(model, value => {
  const target = view.value
  if (!target) return
  const changes = documentChange(target.state.doc.toString(), value)
  if (!changes) return
  target.dispatch({
    changes,
    annotations: Transaction.addToHistory.of(false),
  })
})
watch(
  () => language,
  value => {
    view.value?.dispatch({ effects: languageConfig.reconfigure(languageExtensions(value)) })
    if (view.value) forceLinting(view.value)
  }
)
watch(dark, value => {
  view.value?.dispatch({ effects: themeConfig.reconfigure(editorTheme(value)) })
})
watch(
  () => [readonly, disabled],
  () => {
    const target = view.value
    if (!target) return
    target.dispatch({
      effects: [readonlyConfig.reconfigure(editableExtensions()), contentConfig.reconfigure(contentExtensions())],
    })
    // NOTE: CodeMirror creates its search/replace controls using the read-only state panel construction.
    // close it so the controls cannot become stale
    closeSearchPanel(target)
  }
)
watch(
  () => disabled,
  value => {
    if (value) view.value?.contentDOM.blur()
  }
)
watch(
  () => label,
  () => {
    view.value?.dispatch({ effects: contentConfig.reconfigure(contentExtensions()) })
  }
)
watch(
  () => wrap,
  value => {
    view.value?.dispatch({ effects: wrappingConfig.reconfigure(value ? EditorView.lineWrapping : []) })
  }
)
watch(normalizedIndent, value => {
  view.value?.dispatch({ effects: indentConfig.reconfigure(indentExtensions(value)) })
})
watch(
  () => extensions,
  value => {
    view.value?.dispatch({ effects: customConfig.reconfigure(value) })
  }
)
watch(
  () => [lint, diagnostics],
  () => {
    if (view.value) forceLinting(view.value)
  },
  { deep: true }
)

onBeforeUnmount(() => {
  colorObserver?.disconnect()
  colorMedia?.removeEventListener('change', updateColorMode)
  view.value?.destroy()
  view.value = null
})
</script>

<style scoped>
@layer components {
  .editor-placeholder {
    min-inline-size: 0;
  }
  .expanded-target {
    min-inline-size: 0;
    min-block-size: 0;
    block-size: 100%;
    display: flex;
    flex-direction: column;
  }
  .code-editor {
    --code-comment: light-dark(var(--gray-400), var(--gray-600));
    --code-string: light-dark(var(--green-700), var(--green-300));
    --code-regexp: light-dark(var(--purple-700), var(--purple-300));
    --code-constant: light-dark(var(--cyan-700), var(--cyan-300));
    --code-variable: light-dark(var(--pink-600), var(--pink-400));
    --code-definition: light-dark(var(--indigo-600), var(--indigo-300));
    --code-keyword: light-dark(var(--blue-600), var(--blue-400));
    --code-operator: light-dark(var(--gray-400), var(--gray-500));
    --code-punctuation: light-dark(var(--gray-400), var(--gray-500));
    --code-function: light-dark(var(--blue-700), var(--blue-300));
    --code-type: light-dark(var(--purple-700), var(--purple-300));
    --code-tag: light-dark(var(--pink-700), var(--pink-300));
    --code-attribute: light-dark(var(--teal-700), var(--teal-300));

    display: flex;
    flex-direction: column;
    min-inline-size: 0;
    min-block-size: 0;
    block-size: var(--code-editor-height, 24rem);
    border: var(--border-width-thin) solid var(--divider-color);
    border-radius: var(--radius-lg);
    background: var(--surface-card);
    color: var(--text-color);

    transition-property: border-color;
    transition-duration: var(--duration-md);
    transition-timing-function: var(--bezier-soft-exit);

    &:has(.cm-focused):not(.disabled) {
      border-color: var(--border-color-active);
    }
    &.disabled {
      opacity: 0.6;
    }
    &.disabled .editor-host {
      pointer-events: none;
      user-select: none;
    }
    &.expanded {
      block-size: 100%;
      flex: 1 1 auto;
      border: 0;
      border-radius: 0;
    }
  }
  .toolbar {
    min-block-size: var(--touch-target-min);
    padding: var(--space-xxs) var(--space-md);
    border-block-end: var(--border-width-thin) solid var(--divider-color);
    border-start-start-radius: inherit;
    border-start-end-radius: inherit;
    background: var(--surface-container-low);
  }
  .language-label {
    font-size: var(--font-size-xs);
    color: var(--text-color-quiet);
    user-select: none;
  }
  .editor-host {
    flex: 1 1 0;
    min-block-size: 0;
    min-inline-size: 0;
  }
  .status-bar {
    padding: var(--space-xxs) var(--space-md);
    border-block-start: var(--border-width-thin) solid var(--divider-color);
    border-end-start-radius: inherit;
    border-end-end-radius: inherit;
    background: var(--surface-container-low);
    font-size: var(--font-size-xs);
    color: var(--text-color-quiet);
    user-select: none;
  }
  .cursor-position {
    margin-inline-start: auto;
  }
  .expanded > .toolbar {
    padding-inline: max(var(--space-md), var(--safe-area-left)) max(var(--space-md), var(--safe-area-right));
  }
}
</style>

<style>
.code-editor {
  .cm-editor {
    block-size: 100%;
    min-block-size: 0;
    outline: none;
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
  }

  .cm-scroller {
    overflow: auto;
    font-family: inherit;
    line-height: 1.6;
    scrollbar-width: thin;
  }

  .cm-content {
    padding-block: var(--space-sm);
  }

  .cm-gutters {
    user-select: none;
  }

  .cm-tooltip {
    max-inline-size: min(36rem, 90vw);
  }

  .cm-tooltip-autocomplete > ul {
    max-block-size: min(18rem, 40dvh);
    scrollbar-width: thin;
  }

  .cm-panels {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
  }

  .cm-search {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    align-items: center;
    padding: var(--space-sm);

    input {
      background: var(--surface-container-high);
      color: var(--text-color);
      border: 1px solid var(--border-color-default);
      border-radius: var(--radius-sm);
      padding: var(--space-xs) var(--space-sm);
    }

    button {
      border: 1px solid var(--divider-color);
      border-radius: var(--radius-sm);
      background: var(--surface-container-high);
      color: var(--text-color);
      cursor: pointer;

      &:hover {
        background: var(--tone-primary-container);
      }
    }

    input:focus-visible,
    button:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 1px;
    }
  }

  .cm-focused {
    outline: none;
  }

  .cm-lintRange {
    text-underline-offset: 3px;
  }
}

@media (forced-colors: active) {
  .code-editor .cm-focused {
    outline: 1px solid Highlight;
  }
}
</style>
