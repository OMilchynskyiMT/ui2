<template>
  <FieldFrame
    :id="id"
    ref="frame"
    v-bind="fieldAttributes"
    :disabled="disabled"
    :error="error"
    :focused="isFocused || isOpen"
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
    <template v-for="name in Object.keys(slots).filter(name => !reservedSlots.includes(name))" #[name]>
      <slot :name="name" />
    </template>

    <input v-if="hiddenInputName" :name="hiddenInputName" :value="hiddenInputValue" type="hidden" />

    <button
      :id="id"
      ref="trigger"
      v-bind="triggerAttributes"
      role="combobox"
      :aria-activedescendant="activeOptionId"
      :aria-controls="listId"
      :aria-describedby="description"
      :aria-disabled="disabled"
      :aria-errormessage="isInvalid && hasError ? `${id}-error` : undefined"
      :aria-expanded="isOpen"
      :aria-invalid="isInvalid || undefined"
      :aria-readonly="readonly"
      :disabled="disabled"
      aria-haspopup="listbox"
      class="select-trigger"
      type="button"
      @blur="onBlur"
      @click="toggle"
      @focus="onFocus"
      @keydown="onKeydown"
    >
      <span :class="['value', { placeholder: !selectedOption }]">
        <slot v-if="selectedOption" :item="selectedOption" name="value">
          {{ getListboxOptionText(selectedOption) }}
        </slot>
        <template v-else>{{ placeholder }}</template>
      </span>
      <span aria-hidden="true" class="indicator">
        <MIcon :icon="ChevronDownIcon" size="1rem" />
      </span>
    </button>

    <FieldListboxPopup
      :id="listId"
      :active-value="activeValue"
      :anchor="popupAnchor"
      :items="options"
      :open="isOpen"
      :selected-value="model"
      @activate="activeValue = $event.value"
      @dismiss="close"
      @pointer-end="onListboxPointerEnd"
      @pointer-start="onListboxPointerStart"
      @select="selectOption"
    >
      <template v-if="slots.group" #group="slotProperties">
        <slot v-bind="slotProperties" name="group" />
      </template>
      <template v-if="slots.item" #item="slotProperties">
        <slot v-bind="slotProperties" name="item" />
      </template>
    </FieldListboxPopup>
  </FieldFrame>
</template>

<script lang="ts">
import type { ListboxEntry, ListboxOption } from '../list/listbox.types'
import type { MFieldProperties } from './mfield.shared'

export type SelectModel = string | number | null

export type MSelectProperties<V extends string | number> = Omit<
  MFieldProperties,
  'id' | 'focused' | 'populated' | 'multiline'
> & {
  id?: string
  options: readonly ListboxEntry<V>[]
  placeholder?: string
}

export type MSelectExpose = {
  focus: (options?: FocusOptions) => void
  blur: () => void
  open: () => void
  close: () => void
}

export { TYPEAHEAD_RESET_TIMEOUT } from '@/composables/useTypeahead'
</script>

<script generic="V extends string | number" lang="ts" setup>
import { computed, nextTick, ref, useSlots, useTemplateRef } from 'vue'
import { ChevronDownIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'
import { isTypeaheadKey, useTypeahead } from '@/composables/useTypeahead'

import { useSplitAttributes } from '../component.shared'
import { getListboxOptionText, useListboxNavigation } from '../list/listbox.shared'
import MIcon from '../MIcon.vue'
import FieldListboxPopup from './internal/FieldListboxPopup.vue'
import FieldFrame, { type FieldFrameExpose } from './FieldFrame.vue'
import { useFieldState } from './mfield.shared'

defineOptions({
  inheritAttrs: false,
})

const reservedSlots = ['default', 'group', 'item', 'value']

const {
  id = useId(),
  options,
  readonly = false,
  disabled = false,
  label = '',
  title,
  prefix = '',
  suffix = '',
  error = '',
  hint = '',
  invalid = false,
  placeholder = '',
  variant = 'outlined',
  size = 'medium',
} = defineProps<MSelectProperties<V>>()

const emit = defineEmits<{
  change: [option: ListboxOption<V>]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  select: [option: ListboxOption<V>]
  open: []
  close: []
}>()

const model = defineModel<V | null>({ required: true })
const {
  attributes,
  rootAttributes: fieldAttributes,
  controlAttributes: triggerAttributes,
} = useSplitAttributes(['name'])
const slots = useSlots()
const frame = ref<FieldFrameExpose>()
const triggerReference = useTemplateRef<HTMLButtonElement>('trigger')
const isFocused = ref(false)
const isOpen = ref(false)
let isPointerInteractingWithListbox = false
const listId = `${id}-listbox`

const {
  activeValue,
  enabledOptions,
  activeOption,
  selectedOption,
  syncActiveValue,
  moveActiveValue,
  moveActiveTo,
  getActiveOptionId,
} = useListboxNavigation(
  () => options,
  () => model.value
)

const popupAnchor = computed(() => frame.value?.container ?? null)
const activeOptionId = computed(() => (isOpen.value ? getActiveOptionId(listId) : undefined))
const { hasError, isInvalid, description } = useFieldState(
  id,
  () => invalid,
  () => error,
  () => hint,
  slots
)
const isPopulated = computed(() => Boolean(selectedOption.value) || model.value != null || placeholder.trim() !== '')
const hiddenInputName = computed(() => {
  const name = attributes.name
  return !disabled && typeof name === 'string' ? name : undefined
})
const hiddenInputValue = computed(() => (model.value == null ? '' : String(model.value)))

const focus = (options?: FocusOptions): void => {
  triggerReference.value?.focus(options)
}

const close = (): void => {
  if (!isOpen.value) return

  isOpen.value = false
  typeahead.clear()
  emit('close')
}

const open = (): void => {
  if (readonly || disabled || enabledOptions.value.length === 0 || isOpen.value) return

  syncActiveValue()
  isOpen.value = true
  emit('open')
}

const toggle = (): void => {
  if (readonly || disabled) return

  if (isOpen.value) {
    close()
    return
  }

  open()
}

const selectOption = (option: ListboxOption<V>, focusAfterSelect = true): void => {
  if (readonly || disabled || option.disabled) return

  const changed = model.value !== option.value

  model.value = option.value
  activeValue.value = option.value
  close()
  emit('select', option)

  if (changed) {
    emit('change', option)
  }

  if (focusAfterSelect) {
    void nextTick(focus)
  }
}

const typeahead = useTypeahead<ListboxOption<V>>({
  items: () => enabledOptions.value,
  activeIndex: () => enabledOptions.value.findIndex(option => option.value === activeValue.value),
  getText: getListboxOptionText,
  onMatch: option => {
    activeValue.value = option.value
    if (!isOpen.value) selectOption(option, false)
  },
})

const onFocus = (event: FocusEvent): void => {
  isFocused.value = true
  syncActiveValue()
  emit('focus', event)
}

const onListboxPointerStart = (): void => {
  isPointerInteractingWithListbox = true
}

const onListboxPointerEnd = (): void => {
  isPointerInteractingWithListbox = false
}

const onBlur = (event: FocusEvent): void => {
  isFocused.value = false

  if (!isPointerInteractingWithListbox) {
    close()
  }

  emit('blur', event)
}

const onKeydown = (event: KeyboardEvent): void => {
  if (disabled) return

  if (event.key === 'Tab') {
    close()
    return
  }

  if (readonly) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (isOpen.value) {
      moveActiveValue(1)
    } else {
      open()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (isOpen.value) {
      moveActiveValue(-1)
    } else {
      open()
    }
    return
  }

  if (event.key === 'Home' && isOpen.value) {
    event.preventDefault()
    moveActiveTo('first')
    return
  }

  if (event.key === 'End' && isOpen.value) {
    event.preventDefault()
    moveActiveTo('last')
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()

    if (isOpen.value && activeOption.value) {
      selectOption(activeOption.value)
    } else {
      open()
    }
    return
  }

  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    close()
    return
  }

  if (isTypeaheadKey(event)) {
    typeahead.apply(event.key)
  }
}

defineExpose<MSelectExpose>({
  focus,
  blur: () => triggerReference.value?.blur(),
  open,
  close,
})
</script>

<style scoped>
.select-trigger {
  --cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: var(--gap-x);
  min-inline-size: 0;
  inline-size: 100%;
  block-size: var(--control-height);
  padding: 0;
  border: 0;
  cursor: var(--cursor);
  text-align: start;

  & > .value {
    display: block;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.placeholder {
      color: oklch(from var(--label-color) l c h / 0.5);
    }
  }

  & > .indicator {
    display: grid;
    place-items: center;
    transform: scaleY(1);
    color: oklch(from currentColor l c h / 0.5);

    transition: transform var(--duration-md) var(--bezier-smooth);
  }

  &[aria-expanded='true'] > .indicator {
    transform: scaleY(-1);
  }
}
</style>
