<template>
  <UiStack aria-label="Radio terminal" class="radio-terminal" gap="0" tag="section">
    <UiLogViewer
      v-model:follow="following"
      v-model:wrap="wrapped"
      :downloadable="false"
      :text="transcript"
      empty-text="Enter an AT command to begin"
      label="Radio command transcript"
      search-placeholder="Search transcript"
      style="--log-viewer-height: var(--radio-terminal-output-height, clamp(11rem, 32dvh, 19rem))"
    />

    <UiStack class="command-bar" gap="var(--space-xs)" tag="form" @submit.prevent="send">
      <p class="hint"><kbd>Enter</kbd> to send, <kbd>↑</kbd> and <kbd>↓</kbd> for command history</p>
      <UiCluster gap="var(--space-sm)">
        <UiTextField
          v-model="command"
          :readonly="execution.pending.value"
          aria-label="AT command"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          class="command-field"
          enterkeyhint="send"
          maxlength="1024"
          placeholder="Enter AT command"
          prefix="❯"
          size="small"
          spellcheck="false"
          variant="filled"
          @keydown.down="onHistoryKey($event, 1)"
          @keydown.up="onHistoryKey($event, -1)"
        />

        <UiInline class="command-actions">
          <UiButton :disabled="!command.trim()" :loading="execution.pending.value" type="submit"> Send </UiButton>
          <UiButton
            :disabled="execution.pending.value || !transcript"
            tone="neutral"
            type="button"
            variant="text"
            @click="clearTranscript"
          >
            Clear output
          </UiButton>
        </UiInline>
      </UiCluster>
    </UiStack>
    <span role="status" aria-live="polite" class="visually-hidden">{{ announcement }}</span>
  </UiStack>
</template>

<script lang="ts">
export type RadioCommandExecutor = (command: string) => Promise<string>

export type RadioTerminalProperties = {
  onExecute: RadioCommandExecutor
  historySize?: number
}
</script>

<script lang="ts" setup>
import { ref } from 'vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiTextField from '@/lib/components/fields/UiTextField.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiInline from '@/lib/components/layout/UiInline.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiLogViewer from '@/lib/components/log/UiLogViewer.vue'
import { useAsyncAction } from '@/composables/useAsyncAction'

const { onExecute, historySize = 50 } = defineProps<RadioTerminalProperties>()
const emit = defineEmits<{ 'command-error': [error: unknown] }>()
const command = ref('')
const announcement = ref('')
const transcript = ref('')
const following = ref(true)
const wrapped = ref(true)
const history = ref<string[]>([])
let historyIndex = -1
let savedDraft = ''

const execution = useAsyncAction((value: string) => onExecute(value))

const append = (line: string): void => {
  const next = `${transcript.value}${line}\n`
  const limit = 200_000
  const omitted = '[Earlier output omitted]\n'
  transcript.value = next.length > limit ? `${omitted}${next.slice(-(limit - omitted.length))}` : next
}

const onHistoryKey = (event: KeyboardEvent, direction: -1 | 1): void => {
  if (
    execution.pending.value ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    history.value.length === 0
  )
    return
  const index = historyIndex < 0 ? history.value.length : historyIndex
  const next = Math.max(0, Math.min(history.value.length, index + direction))
  if (next === index) return
  event.preventDefault()
  if (historyIndex < 0) savedDraft = command.value
  historyIndex = next === history.value.length ? -1 : next
  command.value = historyIndex < 0 ? savedDraft : (history.value[historyIndex] ?? '')
}

const send = async (): Promise<void> => {
  if (execution.pending.value) return
  const value = command.value.trim()
  if (!value) return

  history.value = [...history.value, value].slice(-Math.max(0, historySize))
  historyIndex = -1
  savedDraft = ''
  command.value = ''
  append(`${transcript.value ? '\n' : ''}❯ ${value}`)
  announcement.value = 'Sending command'

  try {
    const response = await execution.run(value)
    if (response) append(response.trimEnd())
    announcement.value = 'Command response received'
  } catch (error) {
    append(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    announcement.value = 'Command request failed'
    emit('command-error', error)
  }
}

const clearTranscript = (): void => {
  transcript.value = ''
  following.value = true
  announcement.value = 'Transcript cleared'
}
</script>

<style scoped>
@layer components {
  .radio-terminal {
    position: relative;
    min-inline-size: 0;
    overflow: hidden;
    border: var(--border-width-thin) solid var(--divider-color);
    border-radius: var(--radius-lg);
    background: var(--surface-container-low);

    & > :deep(.log-viewer) {
      border: 0;
      border-radius: 0;
    }

    & > .command-bar {
      padding: var(--space-sm) var(--space-md);
      border-block-start: var(--border-width-thin) solid var(--divider-color);

      & .command-field {
        flex: 1 1 18rem;
        min-inline-size: 0;
      }

      & .command-actions {
        margin-inline-start: auto;
      }

      & .hint {
        color: var(--text-color-dimmed);
        font-size: var(--font-size-xs);
        --kbd-font-size: var(--font-size-xs);
      }
    }
  }
}
</style>
