<template>
  <MDialog
    ref="dialog"
    v-bind="{ style: attributes.style, class: attributes.class }"
    :aria-labelledby="title ? headerId : undefined"
    :persistent="persistent || submitting"
    @cancel="cancelled"
    @close="closed"
  >
    <form ref="form" class="form" novalidate @reset.prevent="cancel" @submit.prevent="submitForm">
      <header v-if="$slots.title || title">
        <h2 :id="headerId" class="title">
          <slot name="title">{{ title }}</slot>
        </h2>
      </header>

      <MScrollArea class="content" fade-edges>
        <div class="content-layout">
          <slot :cancel="cancel" :close="close" :submit="submitForm" :submitting="submitting" />
        </div>
      </MScrollArea>

      <footer class="actions">
        <slot :cancel="cancel" :close="close" :submit="submitForm" :submitting="submitting" name="actions">
          <MButton :disabled="submitting" tone="neutral" type="reset" variant="tonal" @click="cancel">
            <MIcon :icon="XIcon" size="1rem" />
            {{ cancelText }}
          </MButton>
          <MButton
            :disabled="submitting || submitDisabled"
            :loading="submitting && !submittingText"
            tone="primary"
            type="submit"
            variant="filled"
          >
            <MIcon :icon="CheckIcon" size="1rem" />
            {{ submitting && submittingText ? submittingText : submitText }}
          </MButton>
        </slot>
      </footer>
    </form>
  </MDialog>
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
import { ref, useAttrs, useId, useTemplateRef } from 'vue'
import { CheckIcon, XIcon } from '@lucide/vue'

import MButton from '../buttons/MButton.vue'
import MScrollArea from '../layout/MScrollArea.vue'
import MIcon from '../MIcon.vue'
import type { Exposed as DialogExposed } from './MDialog.vue'
import MDialog from './MDialog.vue'

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
const attributes = useAttrs()

const submitting = ref(false)

const show = (): void => {
  dialog.value?.show()
  emit('show')
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

  try {
    emit('submit')
    const result = await submit?.()
    if (result === false) return
    close()
  } catch (error) {
    emit('error', error)
  } finally {
    submitting.value = false
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
    gap: var(--form-gap, var(--space-xxl));
    overflow: clip;
    padding: var(--form-padding, var(--space-xxl));

    .title {
      font-size: var(--title-font-size, var(--font-size-lg));
      font-weight: var(--font-weight-semibold);
    }

    .content {
      min-block-size: 0;
      flex: 1 1 auto;
      --scroll-area-fade-color: var(--dialog-bg, var(--bg));

      & .content-layout {
        display: grid;
        gap: var(--form-content-gap, var(--space-xxl));
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
      gap: var(--actions-gap, var(--space-lg));
    }
  }
}
</style>
