<template>
  <component
    :is="tag"
    :data-align="align"
    :data-repeat="repeat"
    :style="{
      '--auto-grid-gap': gap,
      '--auto-grid-item-min-size': minItemSize,
      '--auto-grid-track-min-size': trackMinSize,
    }"
    class="auto-grid"
  >
    <slot />
  </component>
</template>

<script lang="ts">
export type UiAutoGridProperties = {
  tag?: string
  align?: 'start' | 'center' | 'end' | 'stretch'
  gap?: string
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
  gap,
  minItemSize,
  maxColumns,
  repeat = 'auto-fit',
} = defineProps<UiAutoGridProperties>()

const trackMinSize = computed(() => {
  if (maxColumns === undefined || !Number.isFinite(maxColumns)) return

  const columnCount = Math.max(1, Math.trunc(maxColumns))
  if (columnCount === 1) return '100%'

  const gridGap = 'var(--auto-grid-gap, var(--space-sm))'
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
      auto-fit,
      minmax(min(100%, var(--auto-grid-track-min-size, var(--auto-grid-item-min-size, 14rem))), 1fr)
    );
    gap: var(--auto-grid-gap, var(--space-sm));
    justify-content: start;

    &[data-repeat='auto-fill'] {
      grid-template-columns: repeat(
        auto-fill,
        minmax(min(100%, var(--auto-grid-track-min-size, var(--auto-grid-item-min-size, 14rem))), 1fr)
      );
    }

    &[data-align='start'] {
      align-items: start;
    }

    &[data-align='center'] {
      align-items: center;
    }

    &[data-align='end'] {
      align-items: end;
    }

    &[data-align='stretch'] {
      align-items: stretch;
    }

    & > :deep(*) {
      min-inline-size: 0;
    }
  }
}
</style>
