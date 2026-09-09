<template>
  <MScrollArea class="listbox-scroll" fade-edges overscroll="contain">
    <ul
      :id="id"
      ref="list"
      v-bind="attributes"
      role="listbox"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      class="list"
    >
      <template v-for="(entry, entryIndex) in items" :key="getEntryKey(entry, entryIndex)">
        <li v-if="isListboxGroup(entry)" role="group" :aria-labelledby="getGroupLabelId(entryIndex)" class="group">
          <div :id="getGroupLabelId(entryIndex)" class="group-label">
            <slot :group="entry" :level="0" name="group">
              {{ entry.title }}
            </slot>
          </div>

          <ul role="presentation" class="group-items">
            <ListboxOptionRow
              v-for="option in entry.items"
              :id="getOptionId(option)"
              :key="option.value"
              :active-value="activeValue"
              :level="1"
              :option="option"
              :selected-value="selectedValue"
              @activate="emit('activate', $event)"
              @pointerdown="onPointerDown"
              @select="emit('select', $event)"
            >
              <template v-if="$slots.item" #default="slotProperties">
                <slot v-bind="slotProperties" name="item" />
              </template>
            </ListboxOptionRow>
          </ul>
        </li>

        <ListboxOptionRow
          v-else
          :id="getOptionId(entry)"
          :active-value="activeValue"
          :level="0"
          :option="entry"
          :selected-value="selectedValue"
          @activate="emit('activate', $event)"
          @pointerdown="onPointerDown"
          @select="emit('select', $event)"
        >
          <template v-if="$slots.item" #default="slotProperties">
            <slot v-bind="slotProperties" name="item" />
          </template>
        </ListboxOptionRow>
      </template>
    </ul>
  </MScrollArea>
</template>

<script lang="ts">
import type { ListboxEntry, ListboxOption } from '../listbox.types'

export type ListboxContentExpose = {
  list: HTMLUListElement | null
}

export type ListboxContentProperties<V> = {
  id: string
  items: readonly ListboxEntry<V>[]
  activeValue?: ListboxOption<V>['value']
  selectedValue?: ListboxOption<V>['value'] | null
  ariaLabel?: string
  ariaLabelledby?: string
  preserveFocus?: boolean
}
</script>

<script generic="V extends string | number" lang="ts" setup>
import { computed, nextTick, useAttrs, useTemplateRef, watch } from 'vue'

import MScrollArea from '../../layout/MScrollArea.vue'
import { flattenListboxOptions, getListboxOptionId, isListboxGroup } from '../listbox.shared'
import ListboxOptionRow from './ListboxOptionRow.vue'

const {
  id,
  items,
  activeValue,
  selectedValue,
  ariaLabel,
  ariaLabelledby,
  preserveFocus = false,
} = defineProps<ListboxContentProperties<V>>()
const emit = defineEmits<{
  activate: [option: ListboxOption<V>]
  select: [option: ListboxOption<V>]
}>()

defineOptions({ inheritAttrs: false })

const attributes = useAttrs()
const listReference = useTemplateRef<HTMLUListElement>('list')
const optionIds = computed(() => {
  return new Map(flattenListboxOptions(items).map((option, index) => [option.value, getListboxOptionId(id, index)]))
})

const getEntryKey = (entry: ListboxEntry<V>, index: number): string | number => {
  return isListboxGroup(entry) ? `group-${index}-${entry.title}` : entry.value
}

const getOptionId = (option: ListboxOption<V>): string | undefined => optionIds.value.get(option.value)
const getGroupLabelId = (index: number): string => `${id}-group-${index}`

const onPointerDown = (event: PointerEvent): void => {
  // WARN: keep DOM focus on an owning combobox/select for mouse input. Cancelling
  // touch pointerdown is unreliable on WebKit (iOS) and can suppress selection
  if (preserveFocus && event.pointerType !== 'touch') event.preventDefault()
}

const scrollActiveOptionIntoView = async (): Promise<void> => {
  await nextTick()

  const activeElement = listReference.value?.querySelector('.item.active')
  if (!(activeElement instanceof HTMLElement)) return

  activeElement.scrollIntoView({ block: 'nearest' })
}

watch(() => activeValue, scrollActiveOptionIntoView, { immediate: true, flush: 'post' })

defineExpose<ListboxContentExpose>({
  get list() {
    return listReference.value
  },
})
</script>

<style scoped>
@layer components {
  .listbox-scroll {
    --max-block-size: min(16rem, var(--overlay-available-block-size, 16rem));
    --list-bg: var(--surface-bg);

    max-block-size: var(--max-block-size);
    border-radius: inherit;
    background-color: var(--list-bg);
    --scroll-area-fade-color: var(--list-bg);
  }

  .list {
    --item-min-block-size: calc(var(--font-size-md) * 3);
    --item-padding-inline: var(--font-size-md);

    --item-opacity: 1;
    --item-bg: transparent;
    --item-bg-active: light-dark(
      oklch(from var(--list-bg) calc(l - 0.033) c h),
      oklch(from var(--list-bg) calc(l + 0.033) c h)
    );
    --item-color: inherit;
    --item-color-selected: var(--link-color);
    --group-color: oklch(from currentColor l c h / 0.64);

    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    background-color: var(--list-bg);
    border-radius: inherit;

    & > .group {
      display: flex;
      flex-direction: column;

      & > .group-label {
        min-block-size: calc(var(--item-min-block-size) * 0.75);
        display: flex;
        align-items: end;
        padding-block-end: calc(var(--item-padding-inline) / 4);
        padding-inline: var(--item-padding-inline);
        color: var(--group-color);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        user-select: none;
      }

      & > .group-items {
        display: flex;
        margin: 0;
        padding: 0;
        list-style: none;
        flex-direction: column;
      }
    }
  }
}
</style>
