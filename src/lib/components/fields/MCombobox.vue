<template>
  <FieldFrame
    :id="id"
    ref="frame"
    :disabled="disabled"
    :error="error"
    :focused="isFocused || isOpen"
    :hint="hint"
    :invalid="isInvalid"
    :label="label"
    :populated="text !== '' || placeholder.trim() !== ''"
    :prefix="prefix"
    :readonly="readonly"
    :suffix="suffix"
    :title="title"
    @request-focus="focus"
  >
    <template v-for="name in Object.keys(slots).filter(name => !reservedSlots.includes(name))" #[name]>
      <slot :name="name" />
    </template>

    <input
      :id="id"
      ref="input"
      v-bind="attributes"
      role="combobox"
      :aria-activedescendant="activeOptionId"
      :aria-controls="listId"
      :aria-details="hint || slots.hint ? `${id}-hint` : undefined"
      :aria-disabled="disabled"
      :aria-errormessage="isInvalid && (error || slots.error) ? `${id}-error` : undefined"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-invalid="isInvalid || undefined"
      :aria-readonly="readonly"
      :disabled="disabled"
      :placeholder="placeholder"
      :readonly="readonly"
      :value="text"
      aria-autocomplete="list"
      type="text"
      @blur="onBlur"
      @change="onChange"
      @focus="onFocus"
      @input="onInput"
      @keydown="onKeydown"
    />

    <MPopover
      :anchor="popupAnchor"
      class="combobox-popup"
      match-anchor-width
      :offset="2"
      :open="isOpen"
      @dismiss="close"
    >
      <MListbox
        :id="listId"
        :active-value="activeValue"
        :items="visibleOptions"
        :selected-value="model ?? undefined"
        @hover="activeValue = $event.value"
        @select="selectItem"
      >
        <template #group="{ group, level }">
          <slot v-bind="{ group, level }" name="group">
            <div class="header">{{ group.title }}</div>
          </slot>
        </template>

        <template #item="{ item, level }">
          <slot v-bind="{ item, level }" name="item">
            <div class="title">{{ item.title ?? item.value }}</div>
            <div v-if="item.title" class="value">{{ item.value }}</div>
          </slot>
        </template>
      </MListbox>
    </MPopover>
  </FieldFrame>
</template>

<script lang="ts">
import type { MFieldProperties } from './mfield.shared'
import type { MFieldExpose } from './MTextField.vue'

export type ComboboxModel = string | number | null

export type MComboboxProperties<V extends string | number> = Omit<
  MFieldProperties,
  'id' | 'focused' | 'populated' | 'multiline'
> & {
  id?: string
  options: ListOption<V>[]
  filterable?: boolean
  openOnFocus?: boolean
  placeholder?: string
  matcher?: (item: ListItem<V>, query?: string) => boolean
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
import { computed, nextTick, ref, useAttrs, useId, useSlots, useTemplateRef, watch } from 'vue'

import { flattenListItems, getListItemText, isListGroup } from '../list/listbox.shared'
import type { ListItem, ListOption } from '../list/listbox.types'
import MListbox from '../list/MListbox.vue'
import MPopover from '../overlay/MPopover.vue'
import FieldFrame, { type FieldFrameExpose } from './FieldFrame.vue'
import { useSelectionNavigation } from './selection.shared'

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
  matcher = (item: ListItem<V>, query?: string) =>
    !query || Object.values(item).join(' ').toLowerCase().includes(query.toLowerCase()),
} = defineProps<MComboboxProperties<V>>()

const emit = defineEmits<{
  input: [event: InputEvent]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  select: [item: ListItem<V>]
}>()

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<V | null>({ required: true })
const attributes = useAttrs()
const slots = useSlots()
const frame = ref<FieldFrameExpose>()
const inputReference = useTemplateRef<HTMLInputElement>('input')
const isFocused = ref(false)
const isOpen = ref(false)
const listId = `${id}-listbox`
const text = ref('')

const popupAnchor = computed(() => frame.value?.container ?? null)
const allItems = computed(() => flattenListItems(options))
const selectedItem = computed(() => allItems.value.find(item => item.value === model.value))
const isInvalid = computed(() => invalid || Boolean(error || slots.error))

const isOptionMatched = (item: ListItem<V>, query: string): boolean => {
  return !filterable || matcher(item, query)
}

const filterOptions = (items: readonly ListOption<V>[], query: string): ListOption<V>[] => {
  return items.flatMap((option): ListOption<V>[] => {
    if (!isListGroup(option)) {
      return isOptionMatched(option, query) ? [option] : []
    }

    const matchedItems = option.items.filter(item => isOptionMatched(item, query))
    return matchedItems.length > 0 ? [{ ...option, items: matchedItems }] : []
  })
}

const visibleOptions = computed(() => filterOptions(options, text.value))
const {
  activeValue,
  enabledItems,
  activeItem,
  syncActiveValue,
  moveActiveValue,
  getActiveOptionId,
} = useSelectionNavigation(
  () => visibleOptions.value,
  () => model.value
)
const activeOptionId = computed(() => (isOpen.value ? getActiveOptionId(listId) : undefined))

const setTextFromModel = (): void => {
  const item = selectedItem.value
  text.value = item ? getListItemText(item) : model.value == null ? '' : String(model.value)
}

const open = (): void => {
  if (readonly || disabled || enabledItems.value.length === 0 || isOpen.value) return

  syncActiveValue()
  isOpen.value = true
}

const close = (): void => {
  isOpen.value = false
}

const focus = (options?: FocusOptions): void => {
  inputReference.value?.focus(options)
}

const selectItem = (item: ListItem<V>, focusAfterSelect = true): void => {
  if (readonly || disabled || item.disabled) return

  model.value = item.value
  text.value = getListItemText(item)
  activeValue.value = item.value
  close()
  emit('select', item)

  if (focusAfterSelect) {
    void nextTick(focus)
  }
}

const findExactItem = (): ListItem<V> | undefined => {
  return allItems.value.find(item => getListItemText(item) === text.value)
}

const createStringValue = <T extends string | number>(value: string): T => {
  return value as T
}

const createValueFromCustomText = (value: string): V => {
  return createCustomValue ? createCustomValue(value) : createStringValue<V>(value)
}

const commitText = (): void => {
  const exactItem = findExactItem()

  if (exactItem && !exactItem.disabled) {
    selectItem(exactItem, false)
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
  commitText()
  emit('blur', event)
}

const onKeydown = (event: KeyboardEvent): void => {
  if (readonly || disabled) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!isOpen.value) open()
    else moveActiveValue(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isOpen.value) open()
    else moveActiveValue(-1)
    return
  }

  if (event.key === 'Enter') {
    if (isOpen.value && activeItem.value) {
      event.preventDefault()
      selectItem(activeItem.value)
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
  blur: () => inputReference.value?.blur(),
  select: () => inputReference.value?.select(),
})
</script>

<style scoped>
@layer components {
  input {
    display: block;
    min-inline-size: 0;
    inline-size: 100%;
    block-size: var(--input-height);
    border: 0;
    cursor: var(--cursor);
  }
}
</style>

<style>
@layer components {
  .popover.combobox-popup {
    --bg: var(--surface-bg);
    background-color: var(--bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);

    & > .list {
      --list-bg: var(--bg);

      & .item {
        justify-content: space-between;
        overflow-x: hidden;
        flex-wrap: nowrap;
        gap: var(--input-gap-x);

        & .title,
        & .value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        & .value {
          font-size: var(--font-size-sm);
          color: oklch(from var(--input-label-color) l c h / 0.5);
        }
      }
    }
  }
}
</style>
