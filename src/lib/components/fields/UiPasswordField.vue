<template>
  <UiTextField
    :id="id"
    ref="field"
    v-model="model"
    v-bind="attributes"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    :invalid="invalid"
    :label="label"
    :lazy="lazy"
    :placeholder="placeholder"
    :prefix="prefix"
    :readonly="readonly"
    :size="size"
    :suffix="suffix"
    :title="title"
    :type="visible ? 'text' : 'password'"
    :variant="variant"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
    @focus="emit('focus', $event)"
    @input="emit('input', $event)"
  >
    <template v-if="icon || slots.leading" #leading>
      <slot name="leading">
        <UiIcon v-if="icon" :icon="icon" />
      </slot>
    </template>

    <template #trailing>
      <span class="password-actions">
        <slot name="trailing" />
        <UiButton
          :aria-controls="id"
          :aria-label="visible ? hidePasswordLabel : showPasswordLabel"
          :aria-pressed="visible"
          :disabled="disabled"
          :title="visible ? hidePasswordLabel : showPasswordLabel"
          size="small"
          tone="neutral"
          type="button"
          variant="icon"
          @click="visible = !visible"
        >
          <UiIcon :icon="visible ? EyeOffIcon : EyeIcon" style="--color: var(--gray-500)" />
        </UiButton>
      </span>
    </template>

    <template v-for="name in forwardedSlots" #[name]>
      <slot :name="name" />
    </template>
  </UiTextField>
</template>

<script lang="ts">
import type { Component } from 'vue'

import type { UiTextFieldProperties } from './UiTextField.vue'

export type UiPasswordFieldProperties = Omit<UiTextFieldProperties, 'type'> & {
  icon?: Component | null
  showPasswordLabel?: string
  hidePasswordLabel?: string
}
</script>

<script lang="ts" setup>
import { computed, ref, useAttrs, useSlots, useTemplateRef } from 'vue'
import { EyeIcon, EyeOffIcon, LockKeyholeIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'

import UiButton from '../buttons/UiButton.vue'
import { getForwardedSlotNames } from '../component.shared'
import UiIcon from '../UiIcon.vue'
import { createFieldExpose, type UiFieldExpose } from './field.shared'
import UiTextField from './UiTextField.vue'

const {
  id = useId(),
  readonly = false,
  disabled = false,
  label = '',
  title,
  prefix = '',
  suffix = '',
  error = '',
  invalid = false,
  hint = '',
  lazy = false,
  placeholder = '',
  variant = 'outlined',
  size = 'medium',
  icon = LockKeyholeIcon,
  showPasswordLabel = 'Show password',
  hidePasswordLabel = 'Hide password',
} = defineProps<UiPasswordFieldProperties>()

const emit = defineEmits<{
  input: [event: InputEvent]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const model = defineModel<string>({ required: true })
const attributes = useAttrs()
const slots = useSlots()
const fieldReference = useTemplateRef<UiFieldExpose>('field')
const visible = ref(false)
const forwardedSlots = computed(() => getForwardedSlotNames(slots, ['default', 'leading', 'trailing']))

defineOptions({
  inheritAttrs: false,
})

defineExpose<UiFieldExpose>(createFieldExpose(() => fieldReference.value))
</script>

<style scoped>
@layer components {
  .password-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }
}
</style>
