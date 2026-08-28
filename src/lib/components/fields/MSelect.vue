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
      :aria-describedby="description"
      :aria-disabled="disabled"
      :aria-errormessage="isInvalid && (error || slots.error) ? `${id}-error` : undefined"
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
      <span :class="['value', { placeholder: !selectedItem }]">
        <slot v-if="selectedItem" :item="selectedItem" name="value">
          {{ getListItemText(selectedItem) }}
        </slot>
        <template v-else>{{ placeholder }}</template>
      </span>
      <span aria-hidden="true" class="indicator">
        <MIcon :icon="ChevronDownIcon" size="1rem" />
      </span>
    </button>

    <MPopover :anchor="popupAnchor" :offset="2" :open="isOpen" class="select-popup" match-anchor-width @dismiss="close">
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
    </MPopover>
  </FieldFrame>
</template>

<script lang="ts">
import type { ListItem, ListOption } from '../list/listbox.types'
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
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, useSlots, useTemplateRef } from 'vue'
import { ChevronDownIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'

import { getListItemText } from '../list/listbox.shared'
import MListbox from '../list/MListbox.vue'
import MIcon from '../MIcon.vue'
import MPopover from '../overlay/MPopover.vue'
import FieldFrame, { type FieldFrameExpose } from './FieldFrame.vue'
import { findNextTypeaheadItem, useSelectionNavigation } from './selection.shared'

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
const typeahead = ref('')
const listId = `${id}-listbox`
let typeaheadTimer: ReturnType<typeof globalThis.setTimeout> | undefined

const {
  activeValue,
  enabledItems,
  activeItem,
  selectedItem,
  syncActiveValue,
  moveActiveValue,
  moveActiveTo,
  getActiveOptionId,
} = useSelectionNavigation(
  () => options,
  () => model.value
)

const popupAnchor = computed(() => frame.value?.container ?? null)
const triggerAttributes = computed(() => {
  const { name: _name, ...rest } = attributes
  return rest
})
const activeOptionId = computed(() => (isOpen.value ? getActiveOptionId(listId) : undefined))
const isInvalid = computed(() => invalid || Boolean(error || slots.error))
const description = computed(() => {
  const identifiers: string[] = []
  if (isInvalid.value && (error || slots.error)) identifiers.push(`${id}-error`)
  if (hint || slots.hint) identifiers.push(`${id}-hint`)

  return identifiers.length > 0 ? identifiers.join(' ') : undefined
})
const isPopulated = computed(() => Boolean(selectedItem.value) || model.value != null || placeholder.trim() !== '')
const hiddenInputName = computed(() => {
  const name = attributes.name
  return !disabled && typeof name === 'string' ? name : undefined
})
const hiddenInputValue = computed(() => (model.value == null ? '' : String(model.value)))

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

const selectItem = (item: ListItem<V>, focusAfterSelect = true): void => {
  if (readonly || disabled || item.disabled) return

  const changed = model.value !== item.value

  model.value = item.value
  activeValue.value = item.value
  close()
  emit('select', item)

  if (changed) {
    emit('change', item)
  }

  if (focusAfterSelect) {
    void nextTick(focus)
  }
}

const applyTypeahead = (key: string): void => {
  if (typeaheadTimer) clearTimeout(typeaheadTimer)

  const repeatedKey = typeahead.value.length > 0 && [...typeahead.value].every(character => character === key)
  typeahead.value = repeatedKey ? key : `${typeahead.value}${key}`

  const item = findNextTypeaheadItem(enabledItems.value, activeValue.value, typeahead.value, getListItemText)
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

    if (isOpen.value && activeItem.value) {
      selectItem(activeItem.value)
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
    applyTypeahead(event.key)
  }
}

onBeforeUnmount(clearTypeahead)

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
.popover.select-popup {
  --bg: var(--surface-bg);
  background-color: var(--bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

  & > .listbox-scroll {
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
</style>
