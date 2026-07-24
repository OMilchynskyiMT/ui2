<template>
  <ul role="menu" :style="{ '--icon-size': iconSize, '--arrow-size': arrowSize }" class="tree-menu">
    <li
      v-for="item in items"
      :key="item.title"
      :class="[
        'item',
        {
          expandable: isExpandable(item),
          active: checkActive?.(item),
          expanded: isExpandable(item) && (expanded || expandedItems.includes(item.title)),
          disabled: item.disabled,
        },
      ]"
      :title="item.hint"
    >
      <a @click.prevent="onClick(item)">
        <MIcon v-if="item.icon" :icon="item.icon" :size="iconSize" class="item-icon" />
        <span class="title">{{ item.title }}</span>
        <MIcon v-if="isExpandable(item)" :icon="ChevronUpIcon" :size="arrowSize" class="arrow" />
      </a>

      <MTreeMenu
        v-if="isExpandable(item)"
        :arrow-size="arrowSize"
        :check-active="checkActive"
        :expanded="expanded"
        :icon-size="iconSize"
        :items="item.children"
        :on-select="onSelect"
      />
    </li>
  </ul>
</template>

<script lang="ts">
import { type Component } from 'vue'

export type MTreeMenuProperties<Value> = {
  items: MTreeMenuItem<Value>[]
  expanded?: boolean
  onSelect?: (item: MTreeMenuItem<Value>) => void
  checkActive?: (item: MTreeMenuItem<Value>) => boolean
  iconSize?: string
  arrowSize?: string
}

export type MTreeMenuItem<Value> = {
  title: string
  hint?: string
  value: Value
  icon?: Component
  disabled?: boolean
  children?: MTreeMenuItem<Value>[]
}

export const isExpandable = <Value,>(
  item: MTreeMenuItem<Value>
): item is MTreeMenuItem<Value> & { children: MTreeMenuItem<Value>[] } => {
  return !!item.children && item.children.length > 0
}
</script>

<script generic="V" lang="ts" setup>
import { ref } from 'vue'
import { ChevronUpIcon } from '@lucide/vue'

import MIcon from '../MIcon.vue'

const {
  items,
  expanded,
  onSelect,
  checkActive,
  iconSize = '1.5rem',
  arrowSize = '1rem',
} = defineProps<MTreeMenuProperties<V>>()

const expandedItems = ref<string[]>(
  items
    .filter(isExpandable)
    .filter(item => item.children?.some(subItem => checkActive?.(subItem)))
    .map(item => item.title)
)

const onClick = (item: MTreeMenuItem<V>): void => {
  if (isExpandable(item)) {
    expandedItems.value = expandedItems.value.includes(item.title)
      ? expandedItems.value.filter(title => title !== item.title)
      : [...expandedItems.value, item.title]
  } else {
    onSelect?.(item)
  }
}
</script>

<style scoped>
.tree-menu {
  --gap: var(--space-xxs);
  --item-gap: var(--space-sm);
  --item-cursor: pointer;
  --item-padding-inline: var(--space-sm);
  --item-padding-block: var(--space-sm);
  --accent: var(--blue-500);
  --item-bg: transparent;
  --icon-color: var(--gray-500);
  --arrow-color: oklch(from currentColor l c h / 0.25);
  --indicator-color: transparent;
  --padding: 0px;

  list-style: none;
  accent-color: var(--accent);
  position: relative;
  min-block-size: 0;
  display: grid;
  row-gap: var(--gap);
  padding: var(--padding);

  & > li.item {
    display: grid;
    row-gap: var(--gap);
    user-select: none;

    & > a {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--item-gap);
      color: currentColor;
      cursor: var(--item-cursor);
      padding-inline: var(--item-padding-inline);
      padding-block: var(--item-padding-block);
      border-radius: var(--radius-lg);
      background-color: var(--item-bg);
      transition-property: background-color, color;
      transition-duration: var(--duration-sm);
      transition-timing-function: var(--bezier-smooth);

      &:before {
        content: '';
        position: absolute;
        inline-size: 4px;
        block-size: var(--space-lg);
        border-radius: var(--radius-sm);
        left: calc(-1 * var(--space-sm));
        background-color: var(--indicator-color);
        transition: background-color var(--duration-md) var(--bezier-smooth);
      }

      &:is(:hover) {
        --item-bg: oklch(from var(--accent) l calc(c - 0.1) h / 0.075);
      }

      & > :is(.item-icon, .arrow) {
        flex-grow: 0;
        flex-shrink: 0;
        line-height: 1;
      }

      & > :is(.item-icon) {
        color: var(--icon-color);
      }

      & > :is(.arrow) {
        color: var(--arrow-color);
        transform: scaleY(var(--arrow-scale, 1));
        transition: transform var(--duration-md) var(--bezier-soft-exit);
      }

      & > :is(span.title) {
        flex-grow: 1;
        flex-shrink: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &:is(.active) > a {
      --item-bg: oklch(from var(--accent) l c h / 0.05);
      --item-cursor: default;
    }

    &:is(.disabled) {
      --item-cursor: not-allowed;
    }

    &:is(.expandable) > a {
      font-weight: var(--font-weight-semibold);
    }

    & > .tree-menu {
      position: relative;
      max-height: var(--submenu-height, 0px);
      opacity: var(--submenu-opacity, 0);
      overflow: var(--submenu-overflow, clip);
      transition-property: max-height, opacity;
      transition-duration: var(--duration-md);
      transition-timing-function: var(--bezier-smooth);

      &:before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: calc(var(--icon-size) / 2 + var(--item-gap));
        block-size: 100%;
        border-inline-start: 1px dashed oklch(from currentColor l c h / 0.2);
      }

      & > li > a {
        padding-inline-start: calc(var(--icon-size) + var(--item-gap) + var(--space-xs) * 2);
      }
    }

    &:is(.expanded) {
      --submenu-height: 1000px;
      --submenu-opacity: 1;
      --submenu-overflow: visible;
      --arrow-scale: -1;
    }

    &:is(.expanded, .active) {
      --icon-color: var(--accent);
    }

    &:is(.active) {
      --indicator-color: var(--accent);
    }

    &:is(.expandable):has(.item.active) {
      --indicator-color: oklch(from var(--accent) l calc(c - 0.25) h / 0.25);
    }
  }
}
</style>