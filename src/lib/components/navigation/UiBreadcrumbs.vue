<template>
  <nav v-if="items.length > 0" :aria-label="ariaLabel" class="breadcrumbs">
    <ol>
      <li v-for="(item, index) in items" :key="getItemKey(item, index)" class="breadcrumb-item">
        <UiIcon v-if="index > 0" :icon="ChevronRightIcon" aria-hidden="true" class="separator" />

        <slot :current="index === items.length - 1" :index="index" :item="item" name="item">
          <span
            v-if="index === items.length - 1 || !item.href"
            :aria-current="index === items.length - 1 ? 'page' : undefined"
          >
            {{ item.label }}
          </span>
          <a v-else :href="item.href">{{ item.label }}</a>
        </slot>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts">
export type UiBreadcrumbItem<T = unknown> = {
  label: string
  href?: string
  target?: T
  key?: string | number
}

export type UiBreadcrumbsProperties<T = unknown> = {
  items: UiBreadcrumbItem<T>[]
  ariaLabel?: string
}
</script>

<script generic="T" lang="ts" setup>
import { ChevronRightIcon } from '@lucide/vue'

import UiIcon from '../UiIcon.vue'

const { items, ariaLabel = 'Breadcrumb' } = defineProps<UiBreadcrumbsProperties<T>>()

const getItemKey = (item: UiBreadcrumbItem<T>, index: number): string | number => item.key ?? `${index}-${item.label}`
</script>

<style scoped>
@layer components {
  .breadcrumbs {
    --gap: var(--space-xs);
    --separator-color: var(--text-color-dimmed);

    min-inline-size: 0;

    & > ol {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--gap);
      margin: 0;
      padding: 0;
    }

    .breadcrumb-item {
      min-inline-size: 0;
      display: flex;
      align-items: center;
      gap: var(--gap);

      & > .separator {
        flex: 0 0 auto;
        color: var(--separator-color);
      }

      & > :is(a, span) {
        min-inline-size: 0;
      }

      & > a:focus-visible {
        text-decoration: underline;
        text-decoration-thickness: 2px;
        text-underline-offset: 0.2em;
      }

      & > span[aria-current='page'] {
        color: var(--text-color);
        font-weight: var(--font-weight-semibold);
      }
    }
  }
}
</style>
