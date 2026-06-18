<template>
  <MSelectionControl
    :id="id"
    ref="control"
    v-bind="attrs"
    :checked="checked"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    :invalid="invalid"
    :label="label"
    :readonly="readonly"
    :title="title"
    :value="nativeValue"
    type="radio"
    variant="radio"
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

export type RadioValue = string | number | boolean

export type MRadioProperties<V extends RadioValue> = {
  id?: string
  value: V
  label?: string
  hint?: string
  error?: string
  title?: string
  invalid?: boolean
  disabled?: boolean
  readonly?: boolean
}

export type MRadioExpose = MSelectionControlExpose
</script>

<script generic="V extends RadioValue" lang="ts" setup>
import { computed, ref, useAttrs, useId, useSlots } from 'vue'

import MSelectionControl from './MSelectionControl.vue'

const {
  id = useId(),
  value,
  label = '',
  hint = '',
  error = '',
  title,
  invalid = false,
  disabled = false,
  readonly = false,
} = defineProps<MRadioProperties<V>>()

const emit = defineEmits<{
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const model = defineModel<V>({ required: true })
const attrs = useAttrs()
const slots = useSlots()
const control = ref<MSelectionControlExpose>()

const checked = computed(() => model.value === value)
const nativeValue = computed(() => String(value))

const onChange = (event: Event): void => {
  if ((event.currentTarget as HTMLInputElement).checked) {
    model.value = value
  }

  emit('change', event)
}

defineOptions({
  inheritAttrs: false,
})

defineExpose<MRadioExpose>({
  focus: (options?: FocusOptions) => control.value?.focus(options),
  blur: () => control.value?.blur(),
})
</script>
