<template>
  <MField
    :id="id"
    ref="field"
    v-model="text"
    v-bind="attrs"
    :aria-valuemax="max"
    :aria-valuemin="min"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    :invalid="isInvalid"
    :label="label"
    :prefix="prefix"
    :readonly="readonly"
    :suffix="suffix"
    :title="title"
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
  </MField>
</template>

<script lang="ts">
export type NumberModel = number | null

export const formatNumber = (value: NumberModel): string => {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : ''
}

export type MNumberProperties = Omit<MFieldProperties, 'id' | 'focused' | 'populated' | 'multiline'> & {
  id?: string
  min?: number
  max?: number
  lazy?: boolean
  clampOnBlur?: boolean
}

export type ParseResult = { type: 'empty' } | { type: 'invalid' } | { type: 'number'; value: number }
export const parseNumberText = (value: string): ParseResult => {
  const text = value.trim()

  if (!text) {
    return { type: 'empty' }
  }

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) {
    return { type: 'invalid' }
  }

  const number = Number(text)
  return Number.isFinite(number) ? { type: 'number', value: number } : { type: 'invalid' }
}
</script>

<script lang="ts" setup>
import { computed, ref, useAttrs, useId, useSlots, watch } from 'vue'

import type { MFieldProperties } from './mfield.shared'
import MField, { type MFieldExpose } from './MField.vue'

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
} = defineProps<MNumberProperties>()

const emit = defineEmits<{
  input: [event: InputEvent]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const slots = useSlots()
const attrs = useAttrs()

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

defineExpose<MFieldExpose>({
  focus: options => field.value?.focus(options),
  blur: () => field.value?.blur(),
  select: () => field.value?.select(),
})

const clampNumber = (value: number, min?: number, max?: number): number => {
  if (typeof min === 'number' && value < min) {
    return min
  }
  if (typeof max === 'number' && value > max) {
    return max
  }
  return value
}
</script>
