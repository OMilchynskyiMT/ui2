<template>
  <MSelectionControl
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
  </MSelectionControl>
</template>

<script lang="ts">
import type { MSelectionControlExpose } from './MSelectionControl.vue'

export type MToggleProperties = {
  id?: string
  label?: string
  hint?: string
  error?: string
  title?: string
  invalid?: boolean
  disabled?: boolean
  readonly?: boolean
}

export type MToggleExpose = MSelectionControlExpose
</script>

<script lang="ts" setup>
import { ref, useAttrs, useId, useSlots } from 'vue'

import MSelectionControl from './MSelectionControl.vue'

const {
  id = useId(),
  label = '',
  hint = '',
  error = '',
  title,
  invalid = false,
  disabled = false,
  readonly = false,
} = defineProps<MToggleProperties>()

const emit = defineEmits<{
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const model = defineModel<boolean>({ required: true })
const attributes = useAttrs()
const slots = useSlots()
const control = ref<MSelectionControlExpose>()

const onChange = (event: Event): void => {
  model.value = (event.currentTarget as HTMLInputElement).checked
  emit('change', event)
}

defineOptions({
  inheritAttrs: false,
})

defineExpose<MToggleExpose>({
  focus: (options?: FocusOptions) => control.value?.focus(options),
  blur: () => control.value?.blur(),
})
</script>