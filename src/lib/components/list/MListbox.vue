<template>
  <ul :id="id" ref="list" role="listbox" class="list">
    <template v-for="(option, optionIndex) in items" :key="getOptionKey(option, optionIndex)">
      <li v-if="isListGroup(option)" role="group" :aria-labelledby="getGroupLabelId(optionIndex)" class="group">
        <div :id="getGroupLabelId(optionIndex)" class="group-label">
          <slot :group="option" :level="0" name="group">
            {{ option.title }}
          </slot>
        </div>

        <ul role="presentation" class="group-items">
          <li
            v-for="item in option.items"
            :id="getOptionId(item)"
            :key="item.value"
            role="option"
            :aria-disabled="item.disabled || undefined"
            :aria-selected="item.value === selectedValue"
            :class="[
              'item',
              {
                active: item.value === activeValue,
                selected: item.value === selectedValue,
                disabled: item.disabled,
              },
            ]"
            :style="getLevelStyle(1)"
            @click="onSelect(item)"
            @pointerdown.prevent
            @pointerenter="onHover(item)"
          >
            <slot :item="item" :level="1" name="item">
              {{ getListItemText(item) }}
            </slot>
          </li>
        </ul>
      </li>

      <li
        v-else
        :id="getOptionId(option)"
        role="option"
        :aria-disabled="option.disabled || undefined"
        :aria-selected="option.value === selectedValue"
        :class="[
          'item',
          {
            active: option.value === activeValue,
            selected: option.value === selectedValue,
            disabled: option.disabled,
          },
        ]"
        :style="getLevelStyle(0)"
        @click="onSelect(option)"
        @pointerdown.prevent
        @pointerenter="onHover(option)"
      >
        <slot :item="option" :level="0" name="item">
          {{ getListItemText(option) }}
        </slot>
      </li>
    </template>
  </ul>
</template>

<script lang="ts">
import type { ListItem, ListOption } from './listbox.types'

export type MListboxProperties<V> = {
  id?: string
  items: ListOption<V>[]
  activeValue?: ListItem<V>['value']
  selectedValue?: ListItem<V>['value']
}
</script>

<script generic="V extends string | number" lang="ts" setup>
import { computed, nextTick, useId, useTemplateRef, watch } from 'vue'

import { flattenListItems, getListboxOptionId, getListItemText, isListGroup } from './listbox.shared'

const { id = useId(), items, activeValue, selectedValue } = defineProps<MListboxProperties<V>>()
const listReference = useTemplateRef<HTMLUListElement>('list')

const emit = defineEmits<{
  select: [item: ListItem<V>]
  hover: [item: ListItem<V>]
}>()

const optionIds = computed(() => {
  return new Map(flattenListItems(items).map((item, index) => [item.value, getListboxOptionId(id, index)]))
})

const getOptionKey = (option: ListOption<V>, index: number): string | number => {
  return isListGroup(option) ? `group-${index}-${option.title}` : option.value
}

const getOptionId = (item: ListItem<V>): string | undefined => optionIds.value.get(item.value)
const getGroupLabelId = (index: number): string => `${id}-group-${index}`
const getLevelStyle = (level: number) => ({ '--list-level': level })

const onSelect = (item: ListItem<V>): void => {
  if (item.disabled) return
  emit('select', item)
}

const onHover = (item: ListItem<V>): void => {
  if (item.disabled) return
  emit('hover', item)
}

const scrollActiveItemIntoView = async (): Promise<void> => {
  await nextTick()

  const activeElement = listReference.value?.querySelector('.item.active')
  if (!(activeElement instanceof HTMLElement)) return

  activeElement.scrollIntoView({ block: 'nearest' })
}

watch(() => activeValue, scrollActiveItemIntoView, { immediate: true, flush: 'post' })
</script>

<style scoped>
@layer components {
  .list {
    --max-block-size: min(16rem, var(--overlay-available-block-size, 16rem));
    --item-min-block-size: calc(var(--input-font-size) * 3);
    --item-padding-inline: var(--input-padding-inline);

    --list-bg: var(--surface-bg);
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
    max-block-size: var(--max-block-size);
    overflow: auto;
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
        font-weight: var(--font-weight-medium, 500);
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

    & .item {
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
}
</style>
