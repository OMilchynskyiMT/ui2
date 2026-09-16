<template>
  <UiDialog
    ref="dialog"
    :aria-describedby="slots.default || message ? messageId : undefined"
    :aria-labelledby="slots.title || title ? headerId : undefined"
    @close="closed"
    @closing="closing"
  >
    <form class="confirm" @submit.prevent="accept">
      <header v-if="slots.title || title">
        <h2 :id="headerId">
          <slot name="title">{{ title }}</slot>
        </h2>
      </header>

      <UiScrollArea v-if="slots.default || message" class="message-scroll" fade-edges overscroll="contain">
        <div :id="messageId" :style="{ '--icon-size': iconSize }" class="message">
          <UiIcon :icon="icon" :size="iconSize" class="message-icon" />
          <div>
            <slot>{{ message }}</slot>
          </div>
        </div>
      </UiScrollArea>

      <footer class="actions">
        <UiButton tone="neutral" variant="tonal" @click="decline">
          <template #leading><UiIcon :icon="XIcon" :size="actionIconSize" /></template>
          <span>{{ declineText }}</span>
        </UiButton>
        <UiButton tone="primary" type="submit" variant="outlined">
          <template #leading><UiIcon :icon="CheckIcon" :size="actionIconSize" /></template>
          <span>{{ acceptText }}</span>
        </UiButton>
      </footer>
    </form>
  </UiDialog>
</template>

<script lang="ts">
import { type Component } from 'vue'

export type Properties = {
  headerId?: string
  messageId?: string

  title?: string
  message?: string
  icon?: Component
  iconSize?: string
  actionIconSize?: string

  acceptText?: string
  declineText?: string
}

export type Exposed = {
  confirm: () => Promise<boolean>
}

type PendingConfirmation = {
  promise: Promise<boolean>
  resolve: (value: boolean | PromiseLike<boolean>) => void
  result?: boolean
}
</script>

<script lang="ts" setup>
import { onBeforeUnmount, useSlots, useTemplateRef } from 'vue'
import { CheckIcon, MessageSquareWarningIcon, XIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'

import UiButton from '../buttons/UiButton.vue'
import UiScrollArea from '../layout/UiScrollArea.vue'
import UiIcon from '../UiIcon.vue'
import UiDialog, { type Exposed as DialogExposed } from './UiDialog.vue'

let pending: PendingConfirmation | undefined
const dialog = useTemplateRef<DialogExposed>('dialog')

const slots = useSlots()
const {
  headerId = useId(),
  messageId = useId(),
  title,
  message,
  acceptText = 'OK',
  declineText = 'Cancel',
  icon = MessageSquareWarningIcon,
  iconSize = '3rem',
  actionIconSize = '1rem',
} = defineProps<Properties>()

const confirm = (): Promise<boolean> => {
  if (pending) {
    return pending.promise
  }

  if (!dialog.value) return Promise.resolve(false)

  const { promise, resolve } = Promise.withResolvers<boolean>()
  pending = { promise, resolve }
  dialog.value.show()

  return promise
}

const setResult = (value: boolean): void => {
  // NOTE: first close decision wins
  if (!pending || pending.result !== undefined) return
  pending.result = value
  dialog.value?.close()
}

const settle = (fallback: boolean): void => {
  if (!pending) return

  const current = pending
  pending = undefined
  current.resolve(current.result ?? fallback)
}

const closing = (): void => {
  if (!pending) return
  pending.result ??= false
}

const accept = (): void => setResult(true)
const decline = (): void => setResult(false)
const closed = (): void => settle(false)

defineExpose<Exposed>({ confirm })
onBeforeUnmount(() => settle(false))
</script>

<style scoped>
@layer components {
  .confirm {
    min-block-size: 0;
    max-block-size: inherit;
    display: flex;
    flex-direction: column;
    gap: var(--gap, var(--space-xl));
    overflow: clip;
    padding: var(--padding, var(--space-xl));

    & > header,
    & > footer.actions {
      flex: 0 0 auto;
    }

    & > header {
      &,
      & > h2 {
        font-weight: var(--font-weight-semibold);
      }
    }

    & > .message-scroll {
      min-block-size: 0;
      flex: 1 1 auto;
      --scroll-area-fade-color: var(--dialog-bg, var(--surface-bg));

      & .message {
        display: grid;
        grid-template-columns: var(--icon-size) minmax(0, 1fr);
        gap: var(--message-gap, var(--space-lg));

        & > .message-icon {
          --color: var(--icon-color, var(--orange-400));
        }

        & > div {
          min-inline-size: 0;
          overflow-wrap: anywhere;
          font-size: var(--font-size-md);
        }
      }
    }

    & > footer.actions {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row-reverse;
      gap: var(--actions-gap, var(--space-sm));
    }
  }
}
</style>
