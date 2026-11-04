<template>
  <UiTextField
    :id="id"
    ref="field"
    v-model="text"
    v-bind="attributes"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    :invalid="invalid"
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
  </UiTextField>
</template>

<script lang="ts">
import type { UiFieldProperties } from './field.shared'

export { formatNumber, type NumberModel, parseNumberText, type NumberParseResult as ParseResult } from './number.shared'

export type UiNumberProperties = Omit<UiFieldProperties, 'id' | 'focused' | 'populated' | 'multiline'> & {
  id?: string
  min?: number
  max?: number
  lazy?: boolean
  clampOnBlur?: boolean
}
</script>

<script lang="ts" setup>
import { computed, ref, useAttrs, useSlots, watch } from 'vue'

import { useId } from '@/lib/composables/useId'

import { createFieldExpose, type UiFieldExpose } from './field.shared'
import { clampNumber, formatNumber, type NumberModel, parseNumberText, toNumberModel } from './number.shared'
import UiTextField from './UiTextField.vue'

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
} = defineProps<UiNumberProperties>()

const emit = defineEmits<{
  input: [event: InputEvent]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const slots = useSlots()
const attributes = useAttrs()

const model = defineModel<NumberModel>({ required: true })
const field = ref<UiFieldExpose>()
const text = ref(formatNumber(model.value))
const parsedText = computed(() => parseNumberText(text.value))

watch(model, value => {
  const parsed = parsedText.value
  if (Number.isNaN(value) && parsed.type === 'invalid') return
  if (parsed.type !== 'number' || parsed.value !== value) {
    text.value = formatNumber(value)
  }
})

const commit = (): void => {
  model.value = toNumberModel(parsedText.value)
}

const onInput = (event: InputEvent): void => {
  if (!lazy && !event.isComposing) {
    commit()
  }

  emit('input', event)
}

const onChange = (event: Event): void => {
  if (lazy) commit()
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

defineExpose<UiFieldExpose>(createFieldExpose(() => field.value))
</script>
