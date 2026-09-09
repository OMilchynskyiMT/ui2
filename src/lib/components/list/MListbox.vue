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

export { TYPEAHEAD_RESET_TIMEOUT } from '@/composables/useTypeahead'
</script>

<script generic="V extends string | number" lang="ts" setup>
import { computed, useTemplateRef } from 'vue'

import { useId } from '@/composables/useId'
import { isTypeaheadKey, useTypeahead } from '@/composables/useTypeahead'

import ListboxContent, { type ListboxContentExpose } from './internal/ListboxContent.vue'
import { getListboxOptionText, useListboxNavigation } from './listbox.shared'

const { id = useId(), items, ariaLabel, ariaLabelledby } = defineProps<MListboxProperties<V>>()
const emit = defineEmits<{
  change: [option: ListboxOption<V>]
  select: [option: ListboxOption<V>]
}>()
const model = defineModel<V | null>({ default: null })
const contentReference = useTemplateRef<ListboxContentExpose>('content')

const { activeValue, enabledOptions, activeOption, syncActiveValue, moveActiveValue, moveActiveTo, getActiveOptionId } =
  useListboxNavigation(
    () => items,
    () => model.value
  )

const activeOptionId = computed(() => getActiveOptionId(id))

const selectOption = (option: ListboxOption<V>): void => {
  if (option.disabled) return

  const changed = model.value !== option.value
  model.value = option.value
  activeValue.value = option.value
  emit('select', option)

  if (changed) emit('change', option)
}

const typeahead = useTypeahead<ListboxOption<V>>({
  items: () => enabledOptions.value,
  activeIndex: () => enabledOptions.value.findIndex(option => option.value === activeValue.value),
  getText: getListboxOptionText,
  onMatch: option => {
    activeValue.value = option.value
  },
})

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

  if (isTypeaheadKey(event)) typeahead.apply(event.key)
}

const focus = (options?: FocusOptions): void => {
  contentReference.value?.list?.focus(options)
}

const onPointerDown = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') focus({ preventScroll: true })
}

defineExpose<MListboxExpose>({ focus })
</script>
