<template>
  <SelectionControl
    :id="id"
    ref="control"
    v-bind="attributes"
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
  </SelectionControl>
</template>

<script lang="ts">
import type { SelectionControlExpose } from './SelectionControl.vue'

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

export type MRadioExpose = SelectionControlExpose
</script>

<script generic="V extends RadioValue" lang="ts" setup>
import { computed, ref, useAttrs, useSlots } from 'vue'

import { useId } from '@/composables/useId'

import SelectionControl from './SelectionControl.vue'

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
const attributes = useAttrs()
const slots = useSlots()
const control = ref<SelectionControlExpose>()

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
