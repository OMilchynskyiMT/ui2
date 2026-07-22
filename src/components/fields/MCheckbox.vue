<template>
  <MSelectionControl
    :id="id"
    ref="control"
    v-bind="attributes"
    :checked="model"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    :indeterminate="indeterminate"
    :invalid="invalid"
    :label="label"
    :readonly="readonly"
    :title="title"
    type="checkbox"
    variant="checkbox"
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

export type MCheckboxProperties = {
  id?: string
  label?: string
  hint?: string
  error?: string
  title?: string
  invalid?: boolean
  disabled?: boolean
  readonly?: boolean
  indeterminate?: boolean
}

export type MCheckboxExpose = MSelectionControlExpose
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
  indeterminate = false,
} = defineProps<MCheckboxProperties>()

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

defineExpose<MCheckboxExpose>({
  focus: (options?: FocusOptions) => control.value?.focus(options),
  blur: () => control.value?.blur(),
})
</script>