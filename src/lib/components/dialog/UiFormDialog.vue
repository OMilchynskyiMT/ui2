<template>
  <UiDialog
    ref="dialog"
    :aria-labelledby="slots.title || title ? headerId : undefined"
    :persistent="persistent || submitting"
    @cancel="cancelled"
    @close="closed"
    @show="emit('show')"
  >
    <form
      ref="form"
      :aria-busy="submitting || undefined"
      class="form"
      novalidate
      @reset.prevent="cancel"
      @submit.prevent="submitForm"
    >
      <header v-if="slots.title || title">
        <h2 :id="headerId" class="title">
          <slot name="title">{{ title }}</slot>
        </h2>
      </header>

      <UiScrollArea class="content" fade-edges overscroll="contain">
        <div class="content-layout">
          <slot :cancel="cancel" :close="close" :submit="submitForm" :submitting="submitting" />
        </div>
      </UiScrollArea>

      <footer class="actions">
        <slot :cancel="cancel" :close="close" :submit="submitForm" :submitting="submitting" name="actions">
          <UiButton :disabled="submitting" :icon="XIcon" tone="neutral" type="reset" variant="tonal">
            {{ cancelText }}
          </UiButton>
          <UiButton
            :disabled="submitting || submitDisabled"
            :icon="CheckIcon"
            :loading="submitting && !submittingText"
            tone="primary"
            type="submit"
            variant="filled"
          >
            {{ submitting && submittingText ? submittingText : submitText }}
          </UiButton>
        </slot>
      </footer>
    </form>
  </UiDialog>
</template>

<script lang="ts">
export type Exposed = {
  show: () => void
  close: () => void
  submit: () => Promise<void>
}

type MaybePromise<T> = T | Promise<T>
type SubmitResult = boolean | void
</script>

<script lang="ts" setup>
import { ref, useSlots, useTemplateRef } from 'vue'
import { CheckIcon, XIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'

import UiButton from '../buttons/UiButton.vue'
import UiScrollArea from '../layout/UiScrollArea.vue'
import type { Exposed as DialogExposed } from './UiDialog.vue'
import UiDialog from './UiDialog.vue'

const {
  title,
  submit,
  headerId = useId(),
  persistent = false,
  submitDisabled = false,
  validate = true,
  submitText = 'Save',
  submittingText,
  cancelText = 'Cancel',
} = defineProps<{
  headerId?: string
  title?: string
  submit?: () => MaybePromise<SubmitResult>
  persistent?: boolean
  submitDisabled?: boolean
  validate?: boolean
  submitText?: string
  submittingText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  show: []
  close: []
  cancel: []
  submit: []
  error: [error: unknown]
}>()

const dialog = useTemplateRef<DialogExposed>('dialog')
const form = useTemplateRef<HTMLFormElement>('form')
const slots = useSlots()

const submitting = ref(false)

const show = (): void => {
  dialog.value?.show()
}

const close = (): void => {
  dialog.value?.close()
}

const cancel = (): void => {
  if (submitting.value) return

  emit('cancel')
  close()
}

const cancelled = (): void => {
  emit('cancel')
}

const closed = (): void => {
  submitting.value = false
  emit('close')
}

const isValid = (): boolean => {
  if (!validate) return true
  if (!form.value) return true
  return form.value.reportValidity()
}

const submitForm = async (): Promise<void> => {
  if (submitting.value) return
  if (submitDisabled) return
  if (!isValid()) return

  submitting.value = true
  let keepSubmittingUntilClose = false

  try {
    emit('submit')
    const result = await submit?.()
    if (result === false) return

    if (dialog.value?.isVisible()) {
      keepSubmittingUntilClose = true
      close()
    }
  } catch (error) {
    emit('error', error)
  } finally {
    if (!keepSubmittingUntilClose) {
      submitting.value = false
    }
  }
}

defineExpose<Exposed>({
  show,
  close,
  submit: submitForm,
})
</script>

<style scoped>
@layer components {
  .form {
    min-block-size: 0;
    max-block-size: inherit;
    display: flex;
    flex-direction: column;
    gap: var(--form-gap, var(--space-xl));
    overflow: clip;
    padding: var(--form-padding, var(--space-xl));

    .title {
      font-size: var(--title-font-size, var(--font-size-lg));
      font-weight: var(--font-weight-semibold);
    }

    .content {
      min-block-size: 0;
      flex: 1 1 auto;
      --scroll-area-fade-color: var(--dialog-bg, var(--surface-bg));

      & .content-layout {
        display: grid;
        gap: var(--form-content-gap, var(--space-xl));
      }
    }

    & > header,
    .actions {
      flex: 0 0 auto;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row-reverse;
      gap: var(--actions-gap, var(--space-sm));
    }
  }
}
</style>
