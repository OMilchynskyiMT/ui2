<template>
  <nav v-if="normalizedPageCount > 1" :aria-label="ariaLabel" class="pagination">
    <ul>
      <li>
        <button
          :aria-label="previousLabel"
          :disabled="disabled || currentPage <= 1"
          class="control"
          type="button"
          @click="selectPage(currentPage - 1)"
        >
          <MIcon :icon="ChevronLeftIcon" />
        </button>
      </li>

      <li v-for="item in paginationItems" :key="item.key">
        <span v-if="item.type === 'ellipsis'" aria-hidden="true" class="ellipsis">&hellip;</span>
        <button
          v-else
          :aria-current="item.page === currentPage ? 'page' : undefined"
          :aria-label="getPageLabel(item.page)"
          :class="['page', { active: item.page === currentPage }]"
          :disabled="disabled"
          type="button"
          @click="selectPage(item.page)"
        >
          {{ item.page }}
        </button>
      </li>

      <li>
        <button
          :aria-label="nextLabel"
          :disabled="disabled || currentPage >= normalizedPageCount"
          class="control"
          type="button"
          @click="selectPage(currentPage + 1)"
        >
          <MIcon :icon="ChevronRightIcon" />
        </button>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
export type MPaginationProperties = {
  pageCount: number
  siblingCount?: number
  boundaryCount?: number
  disabled?: boolean
  ariaLabel?: string
  previousLabel?: string
  nextLabel?: string
}

type PaginationPage = {
  type: 'page'
  key: string
  page: number
}

type PaginationEllipsis = {
  type: 'ellipsis'
  key: string
}

type PaginationItem = PaginationPage | PaginationEllipsis
</script>

<script lang="ts" setup>
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'

import MIcon from '../MIcon.vue'

const {
  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
  disabled = false,
  ariaLabel = 'Pagination',
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
} = defineProps<MPaginationProperties>()

const emit = defineEmits<{
  change: [page: number]
}>()

const model = defineModel<number>({ required: true })

const toNonNegativeInteger = (value: number): number => {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0
}

const normalizedPageCount = computed(() => toNonNegativeInteger(pageCount))
const normalizedSiblingCount = computed(() => toNonNegativeInteger(siblingCount))
const normalizedBoundaryCount = computed(() => toNonNegativeInteger(boundaryCount))
const currentPage = computed(() => {
  const page = Number.isFinite(model.value) ? Math.trunc(model.value) : 1
  return Math.min(Math.max(page, 1), Math.max(1, normalizedPageCount.value))
})

const paginationItems = computed<PaginationItem[]>(() => {
  const count = normalizedPageCount.value
  const pages = new Set<number>()

  for (let page = 1; page <= Math.min(normalizedBoundaryCount.value, count); page += 1) {
    pages.add(page)
  }

  for (let page = Math.max(1, count - normalizedBoundaryCount.value + 1); page <= count; page += 1) {
    pages.add(page)
  }

  for (
    let page = Math.max(1, currentPage.value - normalizedSiblingCount.value);
    page <= Math.min(count, currentPage.value + normalizedSiblingCount.value);
    page += 1
  ) {
    pages.add(page)
  }

  const sortedPages = [...pages].toSorted((a, b) => a - b)
  const items: PaginationItem[] = []

  for (const [index, page] of sortedPages.entries()) {
    const previousPage = sortedPages[index - 1]

    if (previousPage !== undefined) {
      const gap = page - previousPage

      if (gap === 2) {
        const missingPage = previousPage + 1
        items.push({ type: 'page', key: `page-${missingPage}`, page: missingPage })
      } else if (gap > 2) {
        items.push({ type: 'ellipsis', key: `ellipsis-${previousPage}-${page}` })
      }
    }

    items.push({ type: 'page', key: `page-${page}`, page })
  }

  return items
})

const selectPage = (page: number): void => {
  if (disabled) return

  const nextPage = Math.min(Math.max(Math.trunc(page), 1), normalizedPageCount.value)
  if (nextPage === model.value) return

  model.value = nextPage
  emit('change', nextPage)
}

const getPageLabel = (page: number): string => {
  return page === currentPage.value ? `Page ${page}, current page` : `Go to page ${page}`
}
</script>

<style scoped>
@layer components {
  .pagination {
    --accent: var(--tone-primary);
    --item-size: 2.25rem;
    --gap: var(--space-xxs);

    inline-size: fit-content;
    max-inline-size: 100%;

    & > ul {
      list-style: none;
      display: flex;
      align-items: center;
      gap: var(--gap);
      margin: 0;
      padding: 0;
    }

    button,
    .ellipsis {
      min-inline-size: var(--item-size);
      block-size: var(--item-size);
      display: grid;
      place-items: center;
      padding-inline: var(--space-xs);
      border: 0;
      border-radius: var(--radius-md);
      color: currentColor;
      background: transparent;
      font: inherit;
    }

    button {
      cursor: pointer;
      transition-property: background-color, color, opacity;
      transition-duration: var(--duration-sm);
      transition-timing-function: var(--bezier-smooth);

      &:is(:hover, :focus-visible) {
        background-color: color-mix(in oklch, var(--accent) 8%, transparent);
      }

      &.active {
        color: var(--accent);
        background-color: color-mix(in oklch, var(--accent) 12%, transparent);
        font-weight: var(--font-weight-semibold);
        cursor: default;
      }

      &:disabled:not(.active) {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }

    .ellipsis {
      color: var(--text-color-dimmed);
      user-select: none;
    }
  }
}
</style>
