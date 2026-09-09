<template>
  <li
    :id="id"
    role="option"
    :aria-disabled="option.disabled || undefined"
    :aria-selected="option.value === selectedValue"
    :class="{
      active: option.value === activeValue,
      selected: option.value === selectedValue,
      disabled: option.disabled,
    }"
    :style="{ '--list-level': level }"
    class="item"
    @click="onSelect"
    @pointerdown="emit('pointerdown', $event)"
    @pointerenter="onPointerEnter"
  >
    <slot :item="option" :level="level">
      {{ getListboxOptionText(option) }}
    </slot>
  </li>
</template>

<script lang="ts">
import type { ListboxOption } from '../listbox.types'

export type ListboxOptionRowProperties<V> = {
  id?: string
  option: ListboxOption<V>
  level: number
  activeValue?: ListboxOption<V>['value']
  selectedValue?: ListboxOption<V>['value'] | null
}
</script>

<script generic="V extends string | number" lang="ts" setup>
import { getListboxOptionText } from '../listbox.shared'

const { option, activeValue, selectedValue } = defineProps<ListboxOptionRowProperties<V>>()
const emit = defineEmits<{
  activate: [option: ListboxOption<V>]
  select: [option: ListboxOption<V>]
  pointerdown: [event: PointerEvent]
}>()

const onSelect = (): void => {
  if (!option.disabled) emit('select', option)
}

const onPointerEnter = (): void => {
  if (option.disabled === true || !matchMedia('(hover: hover)').matches) return
  emit('activate', option)
}
</script>

<style scoped>
@layer components {
  .item {
    min-block-size: var(--item-min-block-size);
    display: flex;
    align-items: center;
    padding-inline: calc(var(--item-padding-inline) + var(--list-level, 0) * 1rem) var(--item-padding-inline);
    cursor: pointer;
    user-select: none;
    background-color: var(--item-bg);
    color: var(--item-color);
    opacity: var(--item-opacity);

    transition-property: background-color, color, opacity;
    transition-duration: var(--duration-sm);
    transition-timing-function: var(--bezier-smooth);

    &.active {
      --item-bg: var(--item-bg-active);
    }

    &.selected {
      --item-color: var(--item-color-selected);
    }

    &.disabled {
      --item-opacity: 0.5;
      pointer-events: none;
    }
  }
}
</style>
