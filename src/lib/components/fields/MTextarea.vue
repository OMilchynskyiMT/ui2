<template>
  <FieldFrame
    :id="id"
    :disabled="disabled"
    :error="error"
    :focused="isFocused"
    :hint="hint"
    :invalid="isInvalid"
    :label="label"
    :populated="currentValue !== '' || placeholder.trim() !== ''"
    :prefix="prefix"
    :readonly="readonly"
    :suffix="suffix"
    :title="title"
    multiline
    @request-focus="focus"
  >
    <template v-for="name in Object.keys(slots).filter(name => !['default', 'counter'].includes(name))" #[name]>
      <slot :name="name" />
    </template>

    <template v-if="counter" #counter>
      <slot :length="length" :maxlength="maxlength" name="counter">
        {{ counterText }}
      </slot>
    </template>

    <textarea
      :id="id"
      ref="textarea"
      v-bind="attributes"
      v-resize="onResize"
      :aria-describedby="description"
      :aria-disabled="disabled"
      :aria-errormessage="isInvalid && (error || slots.error) ? `${id}-error` : undefined"
      :aria-invalid="isInvalid || undefined"
      :aria-readonly="readonly"
      :class="{ 'auto-grow': autoGrow }"
      :disabled="disabled"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :readonly="readonly"
      :rows="rows"
      :value="currentValue"
      @blur="onBlur"
      @change="onChange"
      @focus="onFocus"
      @input="onInput"
    />
  </FieldFrame>
</template>

<script lang="ts">
export type MTextareaExpose = {
  focus: (options?: FocusOptions) => void
  blur: () => void
  select: () => void
  setSelectionRange: HTMLTextAreaElement['setSelectionRange']
}
</script>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, useAttrs, useId, useSlots, useTemplateRef, watch } from 'vue'

import FieldFrame from './FieldFrame.vue'
import { type MFieldProperties } from './mfield.shared'

type Properties = Omit<MFieldProperties, 'id' | 'focused' | 'populated' | 'multiline'> & {
  id?: string
  lazy?: boolean
  placeholder?: string
  rows?: number
  maxlength?: number
  autoGrow?: boolean
  counter?: boolean
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
  lazy = false,
  placeholder = '',
  rows = 3,
  maxlength,
  autoGrow = false,
  counter = false,
} = defineProps<Properties>()

const model = defineModel<string>({ required: true })
const currentValue = ref(model.value)
const textareaReference = useTemplateRef<HTMLTextAreaElement>('textarea')
const isFocused = ref(false)
const isInvalid = computed(() => invalid || Boolean(error || slots.error))
const length = computed(() => currentValue.value.length)
const counterText = computed(() => (maxlength === undefined ? length.value : `${length.value} / ${maxlength}`))
const description = computed(() => {
  const identifiers: string[] = []

  if (isInvalid.value && (error || slots.error)) identifiers.push(`${id}-error`)
  if (hint || slots.hint) identifiers.push(`${id}-hint`)

  return identifiers.length > 0 ? identifiers.join(' ') : undefined
})

const focus = (options?: FocusOptions): void => {
  textareaReference.value?.focus(options)
}

const emit = defineEmits<{
  input: [event: InputEvent]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

defineExpose<MTextareaExpose>({
  focus,
  blur: () => textareaReference.value?.blur(),
  select: () => textareaReference.value?.select(),
  setSelectionRange: (start, end, direction) => {
    textareaReference.value?.setSelectionRange(start, end, direction)
  },
})

const updateBlockSize = (): void => {
  const textarea = textareaReference.value
  if (!textarea) return

  if (!autoGrow) {
    textarea.style.removeProperty('block-size')
    return
  }

  textarea.style.setProperty('block-size', 'auto')
  textarea.style.setProperty('block-size', `${textarea.scrollHeight}px`)
}

const onFocus = (event: FocusEvent): void => {
  isFocused.value = true
  emit('focus', event)
}

const onBlur = (event: FocusEvent): void => {
  isFocused.value = false
  emit('blur', event)
}

const getValue = (event: Event): string => (event.currentTarget as HTMLTextAreaElement).value

const onInput = (event: InputEvent): void => {
  currentValue.value = getValue(event)
  updateBlockSize()

  if (!lazy && !event.isComposing) {
    model.value = currentValue.value
  }

  emit('input', event)
}

const onChange = (event: Event): void => {
  currentValue.value = getValue(event)

  if (lazy) {
    model.value = currentValue.value
  }

  emit('change', event)
}

let observedInlineSize = 0
const onResize = (entry: ResizeObserverEntry): void => {
  const inlineSize = entry.contentRect.width
  if (inlineSize === observedInlineSize) return

  observedInlineSize = inlineSize
  updateBlockSize()
}

onMounted(() => {
  void nextTick(updateBlockSize)
})

watch(
  model,
  value => {
    currentValue.value = value
    void nextTick(updateBlockSize)
  },
  { flush: 'post' }
)

watch([() => autoGrow, () => rows], () => void nextTick(updateBlockSize), { flush: 'post' })
</script>

<style scoped>
@layer components {
  textarea {
    display: block;
    box-sizing: border-box;
    min-inline-size: 0;
    inline-size: 100%;
    min-block-size: calc(var(--input-font-size) * 1.5);
    max-block-size: var(--textarea-max-block-size, none);
    overflow: auto;
    resize: var(--textarea-resize, block);
    line-height: var(--input-line-height, 1.5);
    cursor: var(--cursor);

    &::placeholder {
      opacity: 1;
      color: var(--input-hint-color);
    }

    &:is(.auto-grow) {
      resize: none;
    }
  }
}
</style>
