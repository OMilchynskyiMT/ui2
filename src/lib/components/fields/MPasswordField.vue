<template>
  <MTextField
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
    :suffix="suffix"
    :title="title"
    :type="visible ? 'text' : 'password'"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
    @focus="emit('focus', $event)"
    @input="emit('input', $event)"
  >
    <template v-if="icon || slots.leading" #leading>
      <slot name="leading">
        <MIcon v-if="icon" :icon="icon" />
      </slot>
    </template>

    <template #trailing>
      <span class="password-actions">
        <slot name="trailing" />
        <MButton
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
          <MIcon :icon="visible ? EyeOffIcon : EyeIcon" style="--color: var(--gray-500)" />
        </MButton>
      </span>
    </template>

    <template v-for="name in forwardedSlots" #[name]>
      <slot :name="name" />
    </template>
  </MTextField>
</template>

<script lang="ts">
import type { Component } from 'vue'

import type { MTextFieldProperties } from './MTextField.vue'

export type MPasswordFieldProperties = Omit<MTextFieldProperties, 'type'> & {
  icon?: Component | null
  showPasswordLabel?: string
  hidePasswordLabel?: string
}
</script>

<script lang="ts" setup>
import { computed, ref, useAttrs, useSlots, useTemplateRef } from 'vue'
import { EyeIcon, EyeOffIcon, LockKeyholeIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'

import MButton from '../buttons/MButton.vue'
import MIcon from '../MIcon.vue'
import MTextField, { type MFieldExpose } from './MTextField.vue'

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
  icon = LockKeyholeIcon,
  showPasswordLabel = 'Show password',
  hidePasswordLabel = 'Hide password',
} = defineProps<MPasswordFieldProperties>()

const emit = defineEmits<{
  input: [event: InputEvent]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const model = defineModel<string>({ required: true })
const attributes = useAttrs()
const slots = useSlots()
const fieldReference = useTemplateRef<MFieldExpose>('field')
const visible = ref(false)
const forwardedSlots = computed(() =>
  Object.keys(slots).filter(name => name !== 'default' && name !== 'leading' && name !== 'trailing')
)

defineOptions({
  inheritAttrs: false,
})

defineExpose<MFieldExpose>({
  focus: options => fieldReference.value?.focus(options),
  blur: () => fieldReference.value?.blur(),
  select: () => fieldReference.value?.select(),
})
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
