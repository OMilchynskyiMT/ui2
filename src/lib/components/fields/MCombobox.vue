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
    :populated="text !== '' || placeholder.trim() !== ''"
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

    <input
      :id="id"
      ref="input"
      v-bind="controlAttributes"
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
      :placeholder="placeholder"
      :readonly="readonly"
      :value="text"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      type="text"
      @blur="onBlur"
      @change="onChange"
      @focus="onFocus"
      @input="onInput"
      @keydown="onKeydown"
    />

    <FieldListboxPopup
      :id="listId"
      :active-value="activeValue"
      :anchor="popupAnchor"
      :items="visibleOptions"
      :open="isOpen"
      :selected-value="model"
      @activate="activeValue = $event.value"
      @dismiss="close"
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
import type { MFieldExpose, MFieldProperties } from './mfield.shared'

export type ComboboxModel = string | number | null

export type MComboboxProperties<V extends string | number> = Omit<
  MFieldProperties,
  'id' | 'focused' | 'populated' | 'multiline'
> & {
  id?: string
  options: readonly ListboxEntry<V>[]
  filterable?: boolean
  openOnFocus?: boolean
  placeholder?: string
  matcher?: (option: ListboxOption<V>, query?: string) => boolean
} & CustomComboboxProperties<V>

export type CustomComboboxProperties<V extends string | number> =
  | {
      allowCustom?: false
      createCustomValue?: never
    }
  | {
      allowCustom?: true
      createCustomValue: (text: string) => V
    }

export type MComboboxExpose = MFieldExpose
</script>

<script generic="V extends string | number" lang="ts" setup>
import { computed, nextTick, ref, useSlots, useTemplateRef, watch } from 'vue'

import { useId } from '@/composables/useId'

import { useSplitAttributes } from '../component.shared'
import {
  flattenListboxOptions,
  getListboxOptionText,
  isListboxGroup,
  useListboxNavigation,
} from '../list/listbox.shared'
import FieldListboxPopup from './internal/FieldListboxPopup.vue'
import FieldFrame, { type FieldFrameExpose } from './FieldFrame.vue'
import { useFieldState } from './mfield.shared'

const reservedSlots = ['default', 'group', 'item']

const {
  id = useId(),
  options,
  allowCustom = false,
  createCustomValue,
  filterable = true,
  openOnFocus = false,
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
  matcher = (option: ListboxOption<V>, query?: string) =>
    !query || Object.values(option).join(' ').toLowerCase().includes(query.toLowerCase()),
} = defineProps<MComboboxProperties<V>>()

const emit = defineEmits<{
  input: [event: InputEvent]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  select: [option: ListboxOption<V>]
}>()

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<V | null>({ required: true })
const { rootAttributes: fieldAttributes, controlAttributes } = useSplitAttributes()
const slots = useSlots()
const frame = ref<FieldFrameExpose>()
const inputReference = useTemplateRef<HTMLInputElement>('input')
const isFocused = ref(false)
const isOpen = ref(false)
const listId = `${id}-listbox`
const text = ref('')

const popupAnchor = computed(() => frame.value?.container ?? null)
const allOptions = computed(() => flattenListboxOptions(options))
const selectedOption = computed(() => allOptions.value.find(option => option.value === model.value))
const { hasError, isInvalid, description } = useFieldState(
  id,
  () => invalid,
  () => error,
  () => hint,
  slots
)

const isOptionMatched = (option: ListboxOption<V>, query: string): boolean => {
  return !filterable || matcher(option, query)
}

const filterOptions = (entries: readonly ListboxEntry<V>[], query: string): ListboxEntry<V>[] => {
  return entries.flatMap((option): ListboxEntry<V>[] => {
    if (!isListboxGroup(option)) {
      return isOptionMatched(option, query) ? [option] : []
    }

    const matchedOptions = option.items.filter(nestedOption => isOptionMatched(nestedOption, query))
    return matchedOptions.length > 0 ? [{ ...option, items: matchedOptions }] : []
  })
}

const visibleOptions = computed(() => filterOptions(options, text.value))
const { activeValue, enabledOptions, activeOption, syncActiveValue, moveActiveValue, getActiveOptionId } =
  useListboxNavigation(
    () => visibleOptions.value,
    () => model.value
  )
const activeOptionId = computed(() => (isOpen.value ? getActiveOptionId(listId) : undefined))

const setTextFromModel = (): void => {
  const option = selectedOption.value
  text.value = option ? getListboxOptionText(option) : model.value == null ? '' : String(model.value)
}

const open = (): void => {
  if (readonly || disabled || enabledOptions.value.length === 0 || isOpen.value) return

  syncActiveValue()
  isOpen.value = true
}

const close = (): void => {
  isOpen.value = false
}

const focus = (options?: FocusOptions): void => {
  inputReference.value?.focus(options)
}

const selectOption = (option: ListboxOption<V>, focusAfterSelect = true): void => {
  if (readonly || disabled || option.disabled) return

  model.value = option.value
  text.value = getListboxOptionText(option)
  activeValue.value = option.value
  close()
  emit('select', option)

  if (focusAfterSelect) {
    void nextTick(focus)
  }
}

const findExactOption = (): ListboxOption<V> | undefined => {
  return allOptions.value.find(option => getListboxOptionText(option) === text.value)
}

const createStringValue = <T extends string | number>(value: string): T => {
  return value as T
}

const createValueFromCustomText = (value: string): V => {
  return createCustomValue ? createCustomValue(value) : createStringValue<V>(value)
}

const commitText = (): void => {
  const exactOption = findExactOption()

  if (exactOption && !exactOption.disabled) {
    selectOption(exactOption, false)
    return
  }

  if (allowCustom) {
    model.value = text.value === '' ? null : createValueFromCustomText(text.value)
    close()
    return
  }

  setTextFromModel()
  close()
}

const onInput = (event: InputEvent): void => {
  text.value = (event.currentTarget as HTMLInputElement).value

  if (!event.isComposing) {
    open()
  }

  emit('input', event)
}

const onChange = (event: Event): void => {
  emit('change', event)
}

const onFocus = (event: FocusEvent): void => {
  isFocused.value = true

  if (openOnFocus) {
    open()
  }

  emit('focus', event)
}

const onBlur = (event: FocusEvent): void => {
  isFocused.value = false
  if (!isOpen.value) {
    commitText()
  }

  emit('blur', event)
}

const onKeydown = (event: KeyboardEvent): void => {
  if (readonly || disabled) return

  if (event.key === 'Tab') {
    close()
    return
  }

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

  if (event.key === 'Enter') {
    if (isOpen.value && activeOption.value) {
      event.preventDefault()
      selectOption(activeOption.value)
      return
    }

    commitText()
    return
  }

  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    close()
  }
}

watch(model, setTextFromModel, { immediate: true })
watch(visibleOptions, () => {
  if (isOpen.value) syncActiveValue()
})

defineExpose<MComboboxExpose>({
  focus,
  blur: () => {
    close()
    inputReference.value?.blur()
  },
  select: () => inputReference.value?.select(),
})
</script>

<style scoped>
@layer components {
  input {
    font-size: var(--font-size);
    display: block;
    min-inline-size: 0;
    inline-size: 100%;
    block-size: var(--control-height);
    border: 0;
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
