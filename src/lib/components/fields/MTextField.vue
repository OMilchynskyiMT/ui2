<template>
  <FieldFrame
    :id="id"
    v-bind="fieldAttributes"
    :disabled="disabled"
    :error="error"
    :focused="isFocused"
    :hint="hint"
    :invalid="isInvalid"
    :label="label"
    :populated="isPopulated"
    :prefix="prefix"
    :readonly="readonly"
    :size="size"
    :suffix="suffix"
    :title="title"
    :variant="variant"
    @request-focus="focus"
  >
    <template v-for="name in Object.keys(slots).filter(name => name !== 'default')" #[name]>
      <slot :name="name" />
    </template>

    <input
      :id="id"
      ref="input"
      v-bind="controlAttributes"
      :aria-describedby="description"
      :aria-disabled="disabled"
      :aria-errormessage="isInvalid && hasError ? `${id}-error` : undefined"
      :aria-invalid="isInvalid || undefined"
      :aria-readonly="readonly"
      :disabled="disabled"
      :placeholder="placeholder"
      :readonly="readonly"
      :type="type"
      :value="model"
      @blur="onBlur"
      @change="onChange"
      @focus="onFocus"
      @input="onInput"
    />
  </FieldFrame>
</template>

<script lang="ts">
import type { MFieldProperties } from './mfield.shared'

export type { MFieldExpose } from './mfield.shared'

const nativeStructuredInputTypes = new Set(['date', 'datetime-local', 'month', 'time', 'week'])

export const isNativeStructuredInput = (type: string): boolean => nativeStructuredInputTypes.has(type)

export type MTextFieldProperties = Omit<MFieldProperties, 'id' | 'focused' | 'populated' | 'multiline'> & {
  id?: string
  type?: HTMLInputElement['type']
  lazy?: boolean
  placeholder?: string
}
</script>

<script lang="ts" setup>
import { computed, ref, useSlots, useTemplateRef } from 'vue'

import { useId } from '@/composables/useId'

import { useSplitAttributes } from '../component.shared'
import FieldFrame from './FieldFrame.vue'
import { type MFieldExpose, useFieldState } from './mfield.shared'

defineOptions({
  inheritAttrs: false,
})

const slots = useSlots()
const { rootAttributes: fieldAttributes, controlAttributes } = useSplitAttributes()

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
  type = 'text',
  lazy = false,
  placeholder = '',
  variant = 'outlined',
  size = 'medium',
} = defineProps<MTextFieldProperties>()

const model = defineModel<string>({ required: true })
const inputReference = useTemplateRef<HTMLInputElement>('input')
const isFocused = ref(false)
const { hasError, isInvalid, description } = useFieldState(
  id,
  () => invalid,
  () => error,
  () => hint,
  slots
)
const isPopulated = computed(() => model.value !== '' || placeholder.trim() !== '' || isNativeStructuredInput(type))

const focus = (options?: FocusOptions): void => {
  inputReference.value?.focus(options)
}

const emit = defineEmits<{
  input: [event: InputEvent]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

defineExpose<MFieldExpose>({
  focus,
  blur: () => inputReference.value?.blur(),
  select: () => inputReference.value?.select(),
})

const onFocus = (event: FocusEvent): void => {
  isFocused.value = true
  emit('focus', event)
}

const onBlur = (event: FocusEvent): void => {
  isFocused.value = false
  emit('blur', event)
}

const update = (event: Event): void => {
  model.value = (event.currentTarget as HTMLInputElement).value
}

const onInput = (event: InputEvent): void => {
  if (!lazy && !event.isComposing) {
    update(event)
  }

  emit('input', event)
}

const onChange = (event: Event): void => {
  if (lazy) {
    update(event)
  }

  emit('change', event)
}
</script>

<style scoped>
@layer components {
  input {
    font-size: var(--font-size);
    display: block;
    min-inline-size: 0;
    inline-size: 100%;
    block-size: var(--control-height);
    cursor: var(--cursor);
  }

  @supports (-webkit-touch-callout: none) {
    @media (pointer: coarse) {
      input {
        font-size: max(var(--font-size), 1rem);
      }
    }
  }
}
</style>
