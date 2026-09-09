<template>
  <MTextField
    :id="id"
    ref="field"
    v-model="text"
    v-bind="attributes"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    :invalid="isInvalid"
    :label="label"
    :prefix="prefix"
    :readonly="readonly"
    :size="size"
    :suffix="suffix"
    :title="title"
    :variant="variant"
    inputmode="decimal"
    type="text"
    @blur="onBlur"
    @change="onChange"
    @focus="emit('focus', $event)"
    @input="onInput"
  >
    <template v-for="name in Object.keys(slots)" #[name]>
      <slot :name="name" />
    </template>
  </MTextField>
</template>

<script lang="ts">
import type { MFieldProperties } from './mfield.shared'

export { formatNumber, type NumberModel, parseNumberText, type NumberParseResult as ParseResult } from './number.shared'

export type MNumberProperties = Omit<MFieldProperties, 'id' | 'focused' | 'populated' | 'multiline'> & {
  id?: string
  min?: number
  max?: number
  lazy?: boolean
  clampOnBlur?: boolean
}
</script>

<script lang="ts" setup>
import { computed, ref, useAttrs, useSlots, watch } from 'vue'

import { useId } from '@/composables/useId'

import { createFieldExpose, type MFieldExpose } from './mfield.shared'
import MTextField from './MTextField.vue'
import { clampNumber, formatNumber, type NumberModel, parseNumberText } from './number.shared'

defineOptions({
  inheritAttrs: false,
})

const {
  id = useId(),
  min = -Infinity,
  max = Infinity,
  clampOnBlur = false,
  readonly = false,
  disabled = false,
  label,
  prefix,
  suffix,
  error = '',
  hint = '',
  invalid = false,
  lazy = false,
  variant = 'outlined',
  size = 'medium',
} = defineProps<MNumberProperties>()

const emit = defineEmits<{
  input: [event: InputEvent]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const slots = useSlots()
const attributes = useAttrs()

const model = defineModel<NumberModel>({ required: true })
const field = ref<MFieldExpose>()
const text = ref(formatNumber(model.value))
const parsedText = computed(() => parseNumberText(text.value))
const isInvalid = computed(() => invalid || numberInvalid.value)

watch(model, value => {
  const parsed = parseNumberText(text.value)
  if (parsed.type !== 'number' || parsed.value !== value) {
    text.value = formatNumber(value)
  }
})

const numberInvalid = computed(() => {
  const parsed = parsedText.value
  if (parsed.type === 'invalid') {
    return true
  }
  if (parsed.type !== 'number') {
    return false
  }
  if (typeof min === 'number' && parsed.value < min) {
    return true
  }
  if (typeof max === 'number' && parsed.value > max) {
    return true
  }
  return false
})

const commit = (): void => {
  const parsed = parsedText.value

  if (parsed.type === 'empty') {
    model.value = null
    return
  }

  if (parsed.type === 'number') {
    model.value = parsed.value
  }
}

const onInput = (event: InputEvent): void => {
  if (!lazy && !event.isComposing) {
    commit()
  }

  emit('input', event)
}

const onChange = (event: Event): void => {
  if (lazy) {
    commit()
  }
  emit('change', event)
}

const onBlur = (event: FocusEvent): void => {
  commit()

  const parsed = parseNumberText(text.value)
  if (parsed.type === 'number') {
    let value = parsed.value
    if (clampOnBlur) {
      value = clampNumber(value, min, max)
      model.value = value
    }
    text.value = formatNumber(value)
  }

  emit('blur', event)
}

defineExpose<MFieldExpose>(createFieldExpose(() => field.value))
</script>
