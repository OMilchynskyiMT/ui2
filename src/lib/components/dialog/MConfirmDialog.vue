<template>
  <MDialog
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

      <MScrollArea v-if="slots.default || message" class="message-scroll" fade-edges overscroll="contain">
        <div :id="messageId" :style="{ '--icon-size': iconSize }" class="message">
          <MIcon :icon="icon" :size="iconSize" class="message-icon" />
          <div>
            <slot>{{ message }}</slot>
          </div>
        </div>
      </MScrollArea>

      <footer class="actions">
        <MButton tone="neutral" variant="tonal" @click="decline">
          <MIcon :icon="XIcon" :size="actionIconSize" />
          <span>{{ declineText }}</span>
        </MButton>
        <MButton tone="primary" type="submit" variant="outlined">
          <MIcon :icon="CheckIcon" :size="actionIconSize" />
          <span>{{ acceptText }}</span>
        </MButton>
      </footer>
    </form>
  </MDialog>
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

import MButton from '../buttons/MButton.vue'
import MScrollArea from '../layout/MScrollArea.vue'
import MIcon from '../MIcon.vue'
import MDialog, { type Exposed as DialogExposed } from './MDialog.vue'

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
    gap: var(--gap, var(--space-xxl));
    overflow: clip;
    padding: var(--padding, var(--space-xxl));

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
      --scroll-area-fade-color: var(--dialog-bg, var(--bg));

      & .message {
        display: grid;
        grid-template-columns: var(--icon-size) minmax(0, 1fr);
        gap: var(--gap, var(--space-xxl));

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
      gap: var(--actions-gap, var(--space-lg));
    }
  }
}
</style>
