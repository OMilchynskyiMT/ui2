<template>
  <component
    :is="tag"
    :style="{
      '--auto-grid-gap': gap,
      '--auto-grid-row-gap': rowGap,
      '--auto-grid-column-gap': columnGap,
      '--auto-grid-repeat': repeat,
      '--auto-grid-item-min-size': minItemSize,
      '--auto-grid-track-min-size': trackMinSize,
      '--layout-align': align,
      '--layout-justify': justify,
    }"
    class="auto-grid"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import type { LayoutAlign } from '../layout/layout.types'

export type UiAutoGridProperties = {
  tag?: string
  align?: LayoutAlign
  justify?: LayoutAlign
  gap?: string
  rowGap?: string
  columnGap?: string
  minItemSize?: string
  maxColumns?: number
  repeat?: 'auto-fit' | 'auto-fill'
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'

const {
  tag = 'div',
  align = 'stretch',
  justify = 'stretch',
  gap,
  rowGap,
  columnGap,
  minItemSize,
  maxColumns,
  repeat = 'auto-fit',
} = defineProps<UiAutoGridProperties>()

const trackMinSize = computed(() => {
  if (maxColumns === undefined || !Number.isFinite(maxColumns)) return

  const columnCount = Math.max(1, Math.trunc(maxColumns))
  if (columnCount === 1) return '100%'

  const gridGap = 'var(--auto-grid-column-gap, var(--auto-grid-gap, var(--space-sm)))'
  const gaps = Array.from({ length: columnCount - 1 }, () => gridGap).join(' - ')

  return `max(var(--auto-grid-item-min-size, 14rem), calc((100% - ${gaps}) / ${columnCount}))`
})
</script>

<style scoped>
@layer components {
  .auto-grid {
    min-inline-size: 0;
    display: grid;
    grid-template-columns: repeat(
      var(--auto-grid-repeat),
      minmax(min(100%, var(--auto-grid-track-min-size, var(--auto-grid-item-min-size, 14rem))), 1fr)
    );
    gap: var(--auto-grid-row-gap, var(--auto-grid-gap, var(--space-sm)))
      var(--auto-grid-column-gap, var(--auto-grid-gap, var(--space-sm)));
    justify-content: start;
    align-items: var(--layout-align);
    justify-items: var(--layout-justify);

    & > :deep(*) {
      min-inline-size: 0;
    }
  }
}
</style>
