<template>
  <nav :id="id" ref="menu">
    <div
      v-for="option in options.filter(o => !o.hidden)"
      :key="option.title"
      :class="[
        'option',
        {
          item: isItem(option),
          group: isGroup(option),
          disabled: option.disabled,
          active: (isItem(option) && option.active) || (isGroup(option) && option.items.some(o => o.active)),
          expanded: isGroup(option) && option.expanded,
        },
      ]"
      :title="option.hint"
    >
      <slot :option="option" name="option">
        <div class="inner" @click.prevent="onClick(option)">
          <div v-if="option.icon" class="icon">
            <MIcon :icon="option.icon" size="1.25rem" />
          </div>
          <div class="title">{{ option.title }}</div>
          <div v-if="isGroup(option)" class="arrow">
            <MIcon :icon="ChevronUpIcon" size="1rem" />
          </div>
        </div>

        <div v-if="isGroup(option) && option.items.length > 0" class="items">
          <div
            v-for="item in option.items"
            :key="item.title"
            :class="['item', { active: item.active, disabled: item.disabled }]"
            :title="item.hint"
          >
            <div class="title">{{ item.title }}</div>
          </div>
        </div>
      </slot>
    </div>
  </nav>
</template>

<script lang="ts">
import { type Component } from 'vue'
import type { RouteLocation } from 'vue-router'

type MenuRecord = {
  title: string
  hint?: string
  icon?: Component
  hidden?: boolean
  disabled?: boolean
  onActivate?: () => Promise<void> | void
}

export type MenuItem = MenuRecord & {
  active?: boolean
  to: RouteLocation
}

export type MenuGroup = MenuRecord & {
  expanded?: boolean
  items: MenuItem[]
}

export type MenuOption = MenuItem | MenuGroup

export const isGroup = (item: MenuOption): item is MenuGroup => {
  return (item as MenuGroup).items !== undefined
}

export const isItem = (item: MenuOption): item is MenuItem => {
  return (item as MenuItem).to !== undefined
}
</script>

<script lang="ts" setup>
import { ref, useId } from 'vue'
import { ChevronUpIcon } from '@lucide/vue'

import MIcon from '../MIcon.vue'

const {
  id = useId(),
  options: rawOptions,
  onItemActivate,
  onGroupActivate,
} = defineProps<{
  id?: string
  options: MenuOption[]
  onItemActivate?: (item: MenuItem) => void | Promise<void>
  onGroupActivate?: (group: MenuGroup) => void | Promise<void>
}>()

const options = ref(rawOptions)

const onClick = async (option: MenuOption): Promise<void> => {
  if (isGroup(option)) {
    option.expanded = !Boolean(option.expanded)
    if (option.onActivate) await option.onActivate()
    else if (onGroupActivate) await onGroupActivate(option)
    return
  }

  if (option.onActivate) await option.onActivate()
  else if (onItemActivate) await onItemActivate(option)
}
</script>

<style scoped>
@layer components {
  nav {
    --option-gap-y: var(--space-xxs);
    --option-bg: transparent;
    --option-padding: var(--space-xs);
    --subitems-max-height: 0px;
    --subitems-opacity: 0;

    position: relative;
    display: flex;
    row-gap: var(--option-gap-y);
    flex-direction: column;
    align-items: start;
    justify-content: center;

    & > .option {
      width: 100%;
      cursor: pointer;
    }

    & > .option > .inner,
    & > .option > .items > .item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      column-gap: var(--space-sm);
      background-color: var(--option-bg);
      padding: var(--option-padding);
      border-radius: var(--radius-md);
      user-select: none;

      transition-property: background-color, color;
      transition-duration: var(--duration-sm);
      transition-timing-function: var(--bezier-smooth);

      &:hover,
      &.active {
        --option-bg: oklch(from currentColor l c h / 0.05);
      }

      & > :is(.icon, .arrow) {
        flex-grow: 0;
        flex-shrink: 0;
        line-height: 1;
        color: oklch(from currentColor l c h / 0.6);
      }

      & > :is(.title) {
        flex-grow: 1;
        flex-shrink: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    & > .option > .items {
      max-height: var(--subitems-max-height);
      opacity: var(--subitems-opacity);
      transition-property: max-height, opacity;
      transition-duration: var(--duration-sm);
      transition-timing-function: var(--bezier-smooth);

      & > .item {
        padding-inline-start: var(--space-xxl);
      }
    }

    & > .option > .inner > .arrow {
      transform: scaleY(var(--arrow-scale, 1));
      transition: transform var(--duration-md) var(--bezier-smooth);
    }

    & > .option.expanded {
      --subitems-max-height: 1000px;
      --subitems-opacity: 1;
      --arrow-scale: -1;
    }

    & .item.active::before,
    & > .option.group:not(.expanded):has(.item.active) > .inner::before {
      content: '';
      display: block;
      position: absolute;
      block-size: 65%;
      inline-size: 0.25rem;
      translate: calc(-4 * var(--space-xs)) 0%;
      background-color: oklch(from currentColor l c h / 0.2);
      border-radius: var(--radius-sm);
    }

    & .item.active::before {
      background-color: var(--link-color);
      translate: calc(-1 * var(--space-xxl) - 2 * var(--space-xs)) 0%;
    }
  }
}
</style>