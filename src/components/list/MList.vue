<template>
  <div :id="id" ref="list" role="listbox" class="list">
    <template v-for="row in rows" :key="row.key">
      <div
        v-if="row.type === 'group'"
        role="group"
        :aria-label="row.group.title"
        :style="getLevelStyle(row.level)"
        class="group"
      >
        <slot :group="row.group" :level="row.level" name="group">
          {{ row.group.title }}
        </slot>
      </div>

      <div
        v-else
        :id="row.id"
        role="option"
        :aria-disabled="row.item.disabled || undefined"
        :aria-selected="row.item.value === selectedValue"
        :class="[
          'item',
          {
            active: row.item.value === activeValue,
            selected: row.item.value === selectedValue,
            disabled: row.item.disabled,
          },
        ]"
        :style="getLevelStyle(row.level)"
        @click="onSelect(row.item)"
        @pointerdown.prevent
        @pointerenter="onHover(row.item)"
      >
        <slot :item="row.item" :level="row.level" name="item">
          {{ row.item.title || row.item.value }}
        </slot>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export type ListItem<V> = {
  value: V
  title?: string
  disabled?: boolean
}

export type ListGroup<V> = {
  type: 'group'
  title: string
  items: ListOption<V>[]
}

export type ListOption<V> = ListItem<V> | ListGroup<V>

export type Properties<V> = {
  id?: string
  items: ListOption<V>[]
  activeValue?: ListItem<V>['value']
  selectedValue?: ListItem<V>['value']
}

export type ListItemRow<V> = {
  type: 'item'
  key: string
  id: string
  item: ListItem<V>
  level: number
  optionIndex: number
}

export type ListGroupRow<V> = {
  type: 'group'
  key: string
  group: ListGroup<V>
  level: number
}

export type ListRow<V> = ListItemRow<V> | ListGroupRow<V>

export const getListOptionId = (listId: string, index: number): string => `${listId}-option-${index}`

export const isListGroup = <V,>(option: ListOption<V>): option is ListGroup<V> => {
  return 'items' in option
}

export const flattenListItems = <V,>(items: readonly ListOption<V>[]): ListItem<V>[] => {
  return items.flatMap(item => (isListGroup(item) ? flattenListItems(item.items) : [item]))
}

export const createListRows = <V,>(items: readonly ListOption<V>[], listId: string): ListRow<V>[] => {
  const rows: ListRow<V>[] = []
  let optionIndex = 0

  const walk = (options: readonly ListOption<V>[], level: number, path: string): void => {
    for (const [index, option] of options.entries()) {
      const key = path ? `${path}-${index}` : String(index)

      if (isListGroup(option)) {
        rows.push({ type: 'group', key: `group-${key}`, group: option, level })
        walk(option.items, level + 1, key)
        continue
      }

      const currentOptionIndex = optionIndex
      optionIndex += 1

      rows.push({
        type: 'item',
        key: `item-${key}`,
        id: getListOptionId(listId, currentOptionIndex),
        item: option,
        level,
        optionIndex: currentOptionIndex,
      })
    }
  }

  walk(items, 0, '')
  return rows
}
</script>

<script generic="V extends string | number" lang="ts" setup>
import { computed, nextTick, useId, useTemplateRef, watch } from 'vue'

const { id = useId(), items, activeValue, selectedValue } = defineProps<Properties<V>>()
const listReference = useTemplateRef<HTMLDivElement>('list')

const emit = defineEmits<{
  select: [item: ListItem<V>]
  hover: [item: ListItem<V>]
}>()

const rows = computed(() => createListRows(items, id))

const onSelect = (item: ListItem<V>) => {
  if (item.disabled) return
  emit('select', item)
}

const onHover = (item: ListItem<V>) => {
  if (item.disabled) return
  emit('hover', item)
}

const getLevelStyle = (level: number) => ({ '--list-level': level })

const scrollActiveItemIntoView = async (): Promise<void> => {
  await nextTick()

  const activeElement = listReference.value?.querySelector('.item.active')
  if (!(activeElement instanceof HTMLElement)) return

  activeElement.scrollIntoView({ block: 'nearest' })
}

watch(() => activeValue, scrollActiveItemIntoView, { immediate: true, flush: 'post' })
</script>

<style scoped>
.list {
  --max-block-size: 16rem;
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
  max-block-size: var(--max-block-size);
  overflow: auto;
  background-color: var(--list-bg);
  border-radius: inherit;

  & > .group {
    min-block-size: calc(var(--item-min-block-size) * 0.75);
    display: flex;
    align-items: end;
    padding-block-end: calc(var(--item-padding-inline) / 4);
    padding-inline: calc(var(--item-padding-inline) + var(--list-level, 0) * 1rem) var(--item-padding-inline);
    color: var(--group-color);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium, 500);
    user-select: none;
  }

  & > .item {
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
