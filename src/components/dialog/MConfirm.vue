<template>
  <MDialog
    ref="dialog"
    :aria-describedby="messageId"
    :aria-labeledby="slots.title || title ? headerId : undefined"
    @close="closed"
  >
    <form action="" @reset.prevent="decline" @submit.prevent="accept">
      <section class="content">
        <header v-if="slots.title || title">
          <h2 :id="headerId">
            <slot name="title">{{ title }}</slot>
          </h2>
        </header>

        <main v-if="slots.default || message" :id="messageId">
          <MIcon :icon="MessageSquareWarningIcon" size="3rem" />
          <div>
            <slot>{{ message }}</slot>
          </div>
        </main>

        <footer class="actions">
          <MButton kind="primary" type="submit" variant="outlined">
            <MIcon :icon="CheckIcon" size="1rem" />
            <span>{{ acceptText }}</span>
          </MButton>
          <MButton kind="neutral" type="reset" variant="tonal">
            <MIcon :icon="XIcon" size="1rem" />
            <span>{{ declineText }}</span>
          </MButton>
        </footer>
      </section>
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

  acceptText?: string
  declineText?: string
}

export type Exposed = {
  confirm: () => Promise<boolean>
}
</script>

<script lang="ts" setup>
import { onBeforeUnmount, useId, useSlots, useTemplateRef } from 'vue'
import { CheckIcon, MessageSquareWarningIcon, XIcon } from '@lucide/vue'

import MButton from '@/components/buttons/MButton.vue'
import MDialog, { type Exposed as DialogExposed } from '@/components/dialog/MDialog.vue'
import MIcon from '@/components/MIcon.vue'

const dialog = useTemplateRef<DialogExposed>('dialog')

const slots = useSlots()
const {
  headerId = useId(),
  messageId = useId(),
  title,
  message,
  acceptText = 'OK',
  declineText = 'Cancel',
} = defineProps<Properties>()

let promise: Promise<boolean> | undefined
let resolvePromise: ((value: boolean) => void) | undefined
let result = false

const resolve = (value: boolean): void => {
  if (!resolvePromise) return
  const resolver = resolvePromise

  promise = undefined
  resolvePromise = undefined
  result = false

  resolver(value)
}

const confirm = (): Promise<boolean> => {
  if (promise) return promise
  if (!dialog.value) return Promise.resolve(false)

  result = false

  promise = new Promise<boolean>(resolve => {
    resolvePromise = resolve
  })

  dialog.value.show()

  return promise
}

const setResult = (value: boolean): void => {
  if (!resolvePromise) return
  result = value
  dialog.value?.close()
}

const accept = (): void => setResult(true)
const decline = (): void => setResult(false)
const closed = (): void => {
  resolve(result)
}

defineExpose<Exposed>({ confirm })
onBeforeUnmount(() => {
  resolve(false)
})
</script>

<style scoped>
section.content {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap, var(--space-xxl));
  padding: var(--padding, var(--space-xxl));

  & > header {
    &,
    & > h2 {
      line-height: 1;
      font-weight: 500;
    }
  }

  & > footer.actions {
    display: flex;
    gap: var(--actions-padding, var(--space-lg));
    justify-content: flex-end;
  }

  & > main {
    display: grid;
    grid-template-columns: 3rem 1fr;
    gap: var(--gap, var(--space-xxl));

    & > svg.icon {
      --color: var(--icon-color, var(--orange-400));
    }

    & > div {
      font-size: var(--font-size-md);
    }
  }
}
</style>