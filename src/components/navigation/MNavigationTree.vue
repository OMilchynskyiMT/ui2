<template>
  <ul :style="{ '--icon-size': iconSize, '--arrow-size': arrowSize }" class="navigation-tree">
    <li
      v-for="(item, index) in items"
      :key="`${index}-${item.title}`"
      :class="[
        'item',
        {
          branch: isBranch(item),
          active: isItemActive(item),
          expanded: isBranch(item) && expandedItems.has(index),
          disabled: item.disabled,
        },
      ]"
      :title="item.hint"
    >
      <button
        v-if="isBranch(item)"
        :aria-expanded="expandedItems.has(index)"
        :disabled="item.disabled"
        class="item-control"
        type="button"
        @click="toggle(index)"
      >
        <MIcon v-if="item.icon" :icon="item.icon" :size="iconSize" class="item-icon" />
        <span class="title">{{ item.title }}</span>
        <MIcon :icon="ChevronUpIcon" :size="arrowSize" class="arrow" />
      </button>

      <RouterLink v-else v-slot="{ href, navigate }" :to="item.to" custom>
        <a
          :aria-current="isLeafActive(item) ? 'page' : undefined"
          :aria-disabled="item.disabled || undefined"
          :href="item.disabled ? undefined : href"
          class="item-control"
          @click="onLeafClick($event, item, navigate)"
        >
          <MIcon v-if="item.icon" :icon="item.icon" :size="iconSize" class="item-icon" />
          <span class="title">{{ item.title }}</span>
        </a>
      </RouterLink>

      <div v-if="isBranch(item)" :inert="item.disabled || !expandedItems.has(index)" class="children">
        <MNavigationTree
          :arrow-size="arrowSize"
          :icon-size="iconSize"
          :items="item.children"
          @navigate="emit('navigate', $event)"
        />
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export type MNavigationTreeLeaf = {
  title: string
  icon?: Component
  hint?: string
  disabled?: boolean
  to: RouteLocationRaw
  children?: never
}

export type MNavigationTreeBranch = {
  title: string
  icon?: Component
  hint?: string
  disabled?: boolean
  children: MNavigationTreeItem[]
  to?: never
}

export type MNavigationTreeItem = MNavigationTreeLeaf | MNavigationTreeBranch

export type MNavigationTreeProperties = {
  items: MNavigationTreeItem[]
  iconSize?: string
  arrowSize?: string
}

export const isNavigationTreeBranch = (item: MNavigationTreeItem): item is MNavigationTreeBranch => {
  return 'children' in item && Array.isArray(item.children)
}
</script>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ChevronUpIcon } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import MIcon from '@/lib/components/MIcon.vue'

const { items, iconSize = '1.5rem', arrowSize = '1rem' } = defineProps<MNavigationTreeProperties>()
const emit = defineEmits<{
  navigate: [item: MNavigationTreeLeaf]
}>()

const route = useRoute()
const router = useRouter()
const expandedItems = ref(new Set<number>())
const isBranch = isNavigationTreeBranch

const isLeafActive = (item: MNavigationTreeLeaf): boolean => {
  const resolved = router.resolve(item.to)
  const targetRecord = resolved.matched.at(-1)
  if (!targetRecord) return resolved.path === route.path

  return route.matched.some(record => record.name === targetRecord.name && record.path === targetRecord.path)
}

const isItemActive = (item: MNavigationTreeItem): boolean => {
  return isBranch(item) ? item.children.some(element => isItemActive(element)) : isLeafActive(item)
}

const syncExpandedItems = (): void => {
  const next = new Set(expandedItems.value)

  for (const [index, item] of items.entries()) {
    if (isBranch(item) && item.children.some(element => isItemActive(element))) {
      next.add(index)
    }
  }

  expandedItems.value = next
}

const toggle = (index: number): void => {
  const next = new Set(expandedItems.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  expandedItems.value = next
}

const onLeafClick = (event: MouseEvent, item: MNavigationTreeLeaf, navigate: (event?: MouseEvent) => unknown): void => {
  if (item.disabled) {
    event.preventDefault()
    return
  }

  navigate(event)
  emit('navigate', item)
}

watch(() => [route.fullPath, items] as const, syncExpandedItems, { immediate: true })
</script>

<style scoped>
.navigation-tree {
  --gap: var(--space-xxs);
  --item-gap: var(--space-sm);
  --item-padding-inline: var(--space-sm);
  --item-padding-block: var(--space-sm);
  --accent: var(--blue-500);
  --padding: 0px;

  list-style: none;
  position: relative;
  min-block-size: 0;
  display: grid;
  row-gap: var(--gap);
  padding: var(--padding);

  & > li.item {
    --item-cursor: pointer;
    --item-bg: transparent;
    --icon-color: var(--gray-500);
    --arrow-color: oklch(from currentColor l c h / 0.25);
    --indicator-color: transparent;

    display: grid;
    row-gap: var(--gap);
    user-select: none;

    & > .item-control {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--item-gap);
      inline-size: 100%;
      padding-inline: var(--item-padding-inline);
      padding-block: var(--item-padding-block);
      border: 0;
      border-radius: var(--radius-lg);
      color: currentColor;
      background-color: var(--item-bg);
      text-align: start;
      cursor: var(--item-cursor);

      transition-property: background-color, color;
      transition-duration: var(--duration-sm);
      transition-timing-function: var(--bezier-smooth);

      &::before {
        content: '';
        position: absolute;
        inline-size: 4px;
        block-size: var(--space-lg);
        border-radius: var(--radius-sm);
        inset-inline-start: calc(-1 * var(--space-sm));
        background-color: var(--indicator-color);
        transition: background-color var(--duration-md) var(--bezier-smooth);
      }

      &:hover {
        --item-bg: color-mix(in oklch, var(--accent) 6%, transparent);
      }

      & > :is(.item-icon, .arrow) {
        flex: 0 0 auto;
        line-height: 1;
      }

      & > .item-icon {
        color: var(--icon-color);
      }

      & > .arrow {
        color: var(--arrow-color);
        transform: scaleY(var(--arrow-scale, 1));
        transition: transform var(--duration-md) var(--bezier-soft-exit);
      }

      & > .title {
        flex: 1 1 auto;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &.branch > .item-control {
      font-weight: var(--font-weight-semibold);
    }

    &.disabled {
      --item-cursor: not-allowed;
      opacity: 0.5;
    }

    &.active {
      --icon-color: var(--accent);
      --indicator-color: var(--accent);
    }

    &:not(.branch).active > .item-control {
      --item-bg: color-mix(in oklch, var(--accent) 6%, transparent);
      --item-cursor: default;
    }

    & > .children {
      position: relative;
      display: grid;
      grid-template-rows: 0fr;
      opacity: 0;
      transition-property: grid-template-rows, opacity;
      transition-duration: var(--duration-md);
      transition-timing-function: var(--bezier-smooth);

      &::before {
        content: '';
        position: absolute;
        inset-block: 0;
        inset-inline-start: calc(var(--icon-size) / 2 + var(--item-gap));
        border-inline-start: 1px dashed oklch(from currentColor l c h / 0.2);
      }

      & > .navigation-tree {
        min-block-size: 0;
        padding-inline-start: calc(var(--icon-size) + var(--item-gap) + var(--space-xs));
        overflow: hidden;
      }
    }

    &.expanded {
      --arrow-scale: -1;

      & > .children {
        grid-template-rows: 1fr;
        opacity: 1;
      }
    }
  }
}
</style>
