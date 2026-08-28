<template>
  <SelectionControl
    :id="id"
    ref="control"
    v-bind="attributes"
    role="switch"
    :checked="model"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    :invalid="invalid"
    :label="label"
    :readonly="readonly"
    :title="title"
    type="checkbox"
    variant="toggle"
    @blur="emit('blur', $event)"
    @change="onChange"
    @focus="emit('focus', $event)"
  >
    <template v-if="slots.default" #default>
      <slot />
    </template>

    <template v-if="slots.error" #error>
      <slot name="error" />
    </template>

    <template v-if="slots.hint" #hint>
      <slot name="hint" />
    </template>
  </SelectionControl>
</template>

<script lang="ts">
import type { SelectionControlExpose } from './SelectionControl.vue'

export type MSwitchProperties = {
  id?: string
  label?: string
  hint?: string
  error?: string
  title?: string
  invalid?: boolean
  disabled?: boolean
  readonly?: boolean
}

export type MSwitchExpose = SelectionControlExpose
</script>

<script lang="ts" setup>
import { ref, useAttrs, useSlots } from 'vue'

import { useId } from '@/composables/useId'

import SelectionControl from './SelectionControl.vue'

const {
  id = useId(),
  label = '',
  hint = '',
  error = '',
  title,
  invalid = false,
  disabled = false,
  readonly = false,
} = defineProps<MSwitchProperties>()

const emit = defineEmits<{
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const model = defineModel<boolean>({ required: true })
const attributes = useAttrs()
const slots = useSlots()
const control = ref<SelectionControlExpose>()

const onChange = (event: Event): void => {
  model.value = (event.currentTarget as HTMLInputElement).checked
  emit('change', event)
}

defineOptions({
  inheritAttrs: false,
})

defineExpose<MSwitchExpose>({
  focus: (options?: FocusOptions) => control.value?.focus(options),
  blur: () => control.value?.blur(),
})
</script>
