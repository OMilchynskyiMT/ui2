<template>
  <ListboxContent
    :id="id"
    ref="content"
    :active-value="activeValue"
    :aria-activedescendant="activeOptionId"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :items="items"
    :selected-value="model"
    tabindex="0"
    @activate="activeValue = $event.value"
    @focus="syncActiveValue"
    @keydown="onKeydown"
    @pointerdown="onPointerDown"
    @select="selectOption"
  >
    <template v-if="$slots.group" #group="slotProperties">
      <slot v-bind="slotProperties" name="group" />
    </template>
    <template v-if="$slots.item" #item="slotProperties">
      <slot v-bind="slotProperties" name="item" />
    </template>
  </ListboxContent>
</template>

<script lang="ts">
import type { ListboxEntry, ListboxOption } from './listbox.types'

export type MListboxProperties<V> = {
  id?: string
  items: readonly ListboxEntry<V>[]
  ariaLabel?: string
  ariaLabelledby?: string
}

export type MListboxExpose = {
  focus: (options?: FocusOptions) => void
}

export const TYPEAHEAD_RESET_TIMEOUT = 700
</script>

<script generic="V extends string | number" lang="ts" setup>
import { computed, onBeforeUnmount, useTemplateRef } from 'vue'

import { useId } from '@/composables/useId'

import ListboxContent, { type ListboxContentExpose } from './internal/ListboxContent.vue'
import { findNextListboxOption, useListboxNavigation } from './listbox.shared'

const { id = useId(), items, ariaLabel, ariaLabelledby } = defineProps<MListboxProperties<V>>()
const emit = defineEmits<{
  change: [option: ListboxOption<V>]
  select: [option: ListboxOption<V>]
}>()
const model = defineModel<V | null>({ default: null })
const contentReference = useTemplateRef<ListboxContentExpose>('content')
let typeahead = ''
let typeaheadTimer: ReturnType<typeof globalThis.setTimeout> | undefined

const { activeValue, enabledOptions, activeOption, syncActiveValue, moveActiveValue, moveActiveTo, getActiveOptionId } =
  useListboxNavigation(
    () => items,
    () => model.value
  )

const activeOptionId = computed(() => getActiveOptionId(id))

const clearTypeahead = (): void => {
  typeahead = ''
  if (typeaheadTimer === undefined) return

  clearTimeout(typeaheadTimer)
  typeaheadTimer = undefined
}

const applyTypeahead = (key: string): void => {
  if (typeaheadTimer !== undefined) clearTimeout(typeaheadTimer)

  const normalizedKey = key.toLocaleLowerCase()
  const repeatedKey = typeahead.length > 0 && [...typeahead].every(character => character === normalizedKey)
  typeahead = repeatedKey ? normalizedKey : `${typeahead}${normalizedKey}`

  const option = findNextListboxOption(enabledOptions.value, activeValue.value, typeahead)
  if (option) activeValue.value = option.value

  typeaheadTimer = setTimeout(clearTypeahead, TYPEAHEAD_RESET_TIMEOUT)
}

const selectOption = (option: ListboxOption<V>): void => {
  if (option.disabled) return

  const changed = model.value !== option.value
  model.value = option.value
  activeValue.value = option.value
  emit('select', option)

  if (changed) emit('change', option)
}

const isTypeaheadKey = (event: KeyboardEvent): boolean => {
  return event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey
}

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActiveValue(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActiveValue(-1)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    moveActiveTo('first')
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    moveActiveTo('last')
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    if (!activeOption.value) return

    event.preventDefault()
    selectOption(activeOption.value)
    return
  }

  if (isTypeaheadKey(event)) applyTypeahead(event.key)
}

const focus = (options?: FocusOptions): void => {
  contentReference.value?.list?.focus(options)
}

const onPointerDown = (): void => {
  focus()
}

onBeforeUnmount(clearTypeahead)
defineExpose<MListboxExpose>({ focus })
</script>
