<template>
  <MPopover
    :anchor="anchor"
    :offset="2"
    :open="open"
    class="field-listbox-popup"
    match-anchor-width
    @dismiss="emit('dismiss')"
  >
    <ListboxContent
      :id="id"
      :active-value="activeValue"
      :items="items"
      :selected-value="selectedValue"
      preserve-focus
      @activate="emit('activate', $event)"
      @pointercancel="emit('pointer-end', $event)"
      @pointerdown="emit('pointer-start', $event)"
      @pointerup="emit('pointer-end', $event)"
      @select="emit('select', $event)"
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
    </ListboxContent>
  </MPopover>
</template>

<script lang="ts">
import type { ListboxEntry, ListboxOption } from '../../list/listbox.types'

export type FieldListboxPopupProperties<V> = {
  id: string
  anchor: HTMLElement | null
  open: boolean
  items: readonly ListboxEntry<V>[]
  activeValue?: ListboxOption<V>['value']
  selectedValue?: ListboxOption<V>['value'] | null
}
</script>

<script generic="V extends string | number" lang="ts" setup>
import ListboxContent from '../../list/internal/ListboxContent.vue'
import MPopover from '../../overlay/MPopover.vue'

const { id, anchor, open, items, activeValue, selectedValue } = defineProps<FieldListboxPopupProperties<V>>()
const emit = defineEmits<{
  activate: [option: ListboxOption<V>]
  select: [option: ListboxOption<V>]
  dismiss: []
  'pointer-start': [event: PointerEvent]
  'pointer-end': [event: PointerEvent]
}>()
</script>

<style>
@layer components {
  .popover.field-listbox-popup {
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
        gap: calc(var(--font-size-md) / 2);

        & .title,
        & .value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        & .value {
          font-size: var(--font-size-sm);
          color: light-dark(oklch(from var(--gray-800) l c h / 0.5), oklch(from var(--gray-300) l c h / 0.5));
        }
      }
    }
  }
}
</style>
