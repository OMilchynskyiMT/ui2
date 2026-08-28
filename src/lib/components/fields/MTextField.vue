<template>
  <FieldFrame
    :id="id"
    :disabled="disabled"
    :error="error"
    :focused="isFocused"
    :hint="hint"
    :invalid="isInvalid"
    :label="label"
    :populated="model !== '' || placeholder.trim() !== ''"
    :prefix="prefix"
    :readonly="readonly"
    :suffix="suffix"
    :title="title"
    @request-focus="focus"
  >
    <template v-for="name in Object.keys(slots).filter(name => name !== 'default')" #[name]>
      <slot :name="name" />
    </template>

    <input
      :id="id"
      ref="input"
      v-bind="attributes"
      :aria-describedby="description"
      :aria-disabled="disabled"
      :aria-errormessage="isInvalid && (error || slots.error) ? `${id}-error` : undefined"
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
export type MFieldExpose = {
  focus: (options?: FocusOptions) => void
  blur: () => void
  select: () => void
}
</script>

<script lang="ts" setup>
import { computed, ref, useAttrs, useSlots, useTemplateRef } from 'vue'

import { useId } from '@/composables/useId'

import FieldFrame from './FieldFrame.vue'
import { type MFieldProperties } from './mfield.shared'

type Properties = Omit<MFieldProperties, 'id' | 'focused' | 'populated' | 'multiline'> & {
  id?: string
  type?: HTMLInputElement['type']
  lazy?: boolean
  placeholder?: string
}

defineOptions({
  inheritAttrs: false,
})

const slots = useSlots()
const attributes = useAttrs()

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
} = defineProps<Properties>()

const model = defineModel<string>({ required: true })
const inputReference = useTemplateRef<HTMLInputElement>('input')
const isFocused = ref(false)
const isInvalid = computed(() => invalid || Boolean(error || slots.error))
const description = computed(() => {
  const identifiers: string[] = []
  if (isInvalid.value && (error || slots.error)) identifiers.push(`${id}-error`)
  if (hint || slots.hint) identifiers.push(`${id}-hint`)

  return identifiers.length > 0 ? identifiers.join(' ') : undefined
})

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
    display: block;
    min-inline-size: 0;
    inline-size: 100%;
    block-size: var(--input-height);
    cursor: var(--cursor);
  }
}
</style>
