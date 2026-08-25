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
    :populated="isPopulated"
    :prefix="prefix"
    :readonly="readonly"
    :suffix="suffix"
    :title="title"
    style="--cursor: pointer"
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
      :aria-details="hint || slots.hint ? `${id}-hint` : undefined"
      :aria-disabled="disabled"
      :aria-errormessage="isInvalid && (error || slots.error) ? `${id}-error` : undefined"
      :aria-expanded="isOpen"
      :aria-haspopup="'listbox'"
      :aria-invalid="isInvalid || undefined"
      :aria-readonly="readonly"
      :disabled="disabled"
      class="select-trigger"
      type="button"
      @blur="onBlur"
      @click="toggle"
      @focus="onFocus"
      @keydown="onKeydown"
    >
      <span :class="['value', { placeholder: !selectedItem }]">
        <slot v-if="selectedItem" :item="selectedItem" name="value">
          {{ getItemText(selectedItem) }}
        </slot>
        <template v-else>{{ placeholder }}</template>
      </span>
      <span aria-hidden="true" class="indicator">
        <MIcon :icon="ChevronDownIcon" size="1rem" />
      </span>
    </button>

    <MPopup :anchor="popupAnchor" :offset="2" :open="isOpen" class="select-popup" parent-width @close="close">
      <MListbox
        :id="listId"
        :active-value="activeValue"
        :items="options"
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
    </MPopup>
  </FieldFrame>
</template>

<script lang="ts">
import type { ListItem, ListOption } from '@/components/list/MListbox.vue'

import type { MFieldProperties } from './mfield.shared'

export type SelectModel = string | number | null

export type MSelectProperties<V extends string | number> = Omit<
  MFieldProperties,
  'id' | 'focused' | 'populated' | 'multiline'
> & {
  id?: string
  options: ListOption<V>[]
  placeholder?: string
}

export type MSelectExpose = {
  focus: (options?: FocusOptions) => void
  blur: () => void
  open: () => void
  close: () => void
}

export const TYPEAHEAD_RESET_TIMEOUT = 700
</script>

<script generic="V extends string | number" lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, useId, useSlots, useTemplateRef } from 'vue'
import { ChevronDownIcon } from '@lucide/vue'

import MListbox, { flattenListItems, getListOptionId } from '@/components/list/MListbox.vue'
import MPopup from '@/components/popup/MPopup.vue'

import MIcon from '../MIcon.vue'

import FieldFrame, { type FieldFrameExpose } from './FieldFrame.vue'

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
} = defineProps<MSelectProperties<V>>()

const emit = defineEmits<{
  change: [item: ListItem<V>]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  select: [item: ListItem<V>]
  open: []
  close: []
}>()

const model = defineModel<V | null>({ required: true })
const attributes = useAttrs()
const slots = useSlots()
const frame = ref<FieldFrameExpose>()
const triggerReference = useTemplateRef<HTMLButtonElement>('trigger')
const isFocused = ref(false)
const isOpen = ref(false)
const activeValue = ref<V>()
const typeahead = ref('')
const listId = `${id}-listbox`
const previousValue = ref<V | null>(null)
let typeaheadTimer: ReturnType<typeof globalThis.setTimeout> | undefined

const popupAnchor = computed(() => frame.value?.container ?? null)
const triggerAttributes = computed(() => {
  const { name: _name, ...rest } = attributes

  return rest
})
const items = computed(() => flattenListItems(options))
const enabledItems = computed(() => items.value.filter(item => !item.disabled))

const selectedItem = computed(() => {
  return items.value.find(item => item.value === model.value)
})

const activeItem = computed(() => {
  return items.value.find(item => item.value === activeValue.value && !item.disabled)
})

const activeOptionId = computed(() => {
  if (!isOpen.value) return

  const index = items.value.findIndex(item => item.value === activeValue.value)
  return index === -1 ? undefined : getListOptionId(listId, index)
})

const isInvalid = computed(() => invalid || Boolean(error || slots.error))

const isPopulated = computed(() => Boolean(selectedItem.value) || model.value != null || placeholder.trim() !== '')

const hiddenInputName = computed(() => {
  const name = attributes.name
  return !disabled && typeof name === 'string' ? name : undefined
})

const hiddenInputValue = computed(() => (model.value == null ? '' : String(model.value)))

const getItemText = (item: ListItem<V>): string => {
  return item.title ?? String(item.value)
}

const focus = (options?: FocusOptions): void => {
  triggerReference.value?.focus(options)
}

const clearTypeahead = (): void => {
  typeahead.value = ''
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
}

const close = (): void => {
  if (!isOpen.value) return

  isOpen.value = false
  clearTypeahead()
  emit('close')
}

const syncActiveValue = (): void => {
  const enabled = enabledItems.value
  if (enabled.length === 0) {
    activeValue.value = undefined
    return
  }

  const selected = enabled.find(item => item.value === model.value)
  activeValue.value = selected?.value ?? enabled[0]?.value
}

const open = (): void => {
  if (readonly || disabled || enabledItems.value.length === 0 || isOpen.value) return

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

const moveActiveValue = (delta: -1 | 1): void => {
  const enabled = enabledItems.value
  if (enabled.length === 0) return

  const currentIndex = enabled.findIndex(item => item.value === activeValue.value)
  const nextIndex =
    currentIndex === -1
      ? delta > 0
        ? 0
        : enabled.length - 1
      : (currentIndex + delta + enabled.length) % enabled.length
  const item = enabled[nextIndex]

  if (item) {
    activeValue.value = item.value
  }
}

const moveToEdge = (edge: 'first' | 'last'): void => {
  const enabled = enabledItems.value
  const item = edge === 'first' ? enabled[0] : enabled.at(-1)

  if (item) {
    activeValue.value = item.value
  }
}

const selectItem = (item: ListItem<V>, focusAfterSelect = true): void => {
  if (readonly || disabled || item.disabled) return

  model.value = item.value
  activeValue.value = item.value
  close()
  emit('select', item)
  if (previousValue.value !== item.value) {
    emit('change', item)
    previousValue.value = item.value
  }

  if (focusAfterSelect) {
    void nextTick(() => {
      focus()
    })
  }
}

const findTypeaheadItem = (query: string) => {
  const normalizedQuery = query.toLowerCase()
  const selectedIndex = enabledItems.value.findIndex(item => item.value === activeValue.value)
  const orderedItems =
    selectedIndex === -1
      ? enabledItems.value
      : [...enabledItems.value.slice(selectedIndex + 1), ...enabledItems.value.slice(0, selectedIndex + 1)]

  return orderedItems.find(item => getItemText(item).toLowerCase().startsWith(normalizedQuery))
}

const applyTypeahead = (key: string): void => {
  if (typeaheadTimer) {
    clearTimeout(typeaheadTimer)
  }

  const repeatedKey = typeahead.value.length > 0 && [...typeahead.value].every(character => character === key)
  typeahead.value = repeatedKey ? key : `${typeahead.value}${key}`

  const item = findTypeaheadItem(typeahead.value)
  if (item) {
    activeValue.value = item.value

    if (!isOpen.value) {
      selectItem(item, false)
    }
  }

  typeaheadTimer = setTimeout(clearTypeahead, TYPEAHEAD_RESET_TIMEOUT)
}

const isTypeaheadKey = (event: KeyboardEvent): boolean => {
  return event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey
}

const onFocus = (event: FocusEvent): void => {
  isFocused.value = true
  syncActiveValue()
  emit('focus', event)
}

const onBlur = (event: FocusEvent): void => {
  isFocused.value = false
  close()
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

    if (!isOpen.value) {
      open()
      return
    }

    moveActiveValue(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()

    if (!isOpen.value) {
      open()
      return
    }

    moveActiveValue(-1)
    return
  }

  if (event.key === 'Home' && isOpen.value) {
    event.preventDefault()
    moveToEdge('first')
    return
  }

  if (event.key === 'End' && isOpen.value) {
    event.preventDefault()
    moveToEdge('last')
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()

    if (isOpen.value && activeItem.value) {
      selectItem(activeItem.value)
      return
    }

    open()
    return
  }

  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    close()
    return
  }

  if (isTypeaheadKey(event)) {
    applyTypeahead(event.key)
  }
}

onBeforeUnmount(() => {
  clearTypeahead()
})

defineExpose<MSelectExpose>({
  focus,
  blur: () => triggerReference.value?.blur(),
  open,
  close,
})
</script>

<style scoped>
.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: var(--input-gap-x);
  min-inline-size: 0;
  inline-size: 100%;
  block-size: var(--input-height);
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
      color: oklch(from var(--input-label-color) l c h / 0.5);
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

<style>
.popup.select-popup {
  --bg: var(--surface-bg);
  background-color: var(--bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

  & > .list {
    --list-bg: var(--bg);

    & > .item {
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
</style>
