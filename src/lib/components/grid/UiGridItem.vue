<template>
  <component
    :is="tag"
    :data-span="normalizedSpan === 'full' ? 'full' : undefined"
    :style="{
      '--grid-item-span': normalizedSpan === 'full' ? undefined : normalizedSpan,
      '--layout-align': align,
      '--layout-justify': justify,
    }"
    class="grid-item"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import type { LayoutAlign } from '../layout/layout.types'

export type UiGridItemProperties = {
  tag?: string
  span?: number | 'full'
  align?: LayoutAlign
  justify?: LayoutAlign
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'

const { tag = 'div', span = 1, align = 'stretch', justify = 'stretch' } = defineProps<UiGridItemProperties>()

const normalizedSpan = computed(() => {
  if (span === 'full') return span
  if (!Number.isFinite(span)) return 1
  return Math.max(1, Math.trunc(span))
})
</script>

<style scoped>
@layer components {
  .grid-item {
    min-inline-size: 0;
    grid-column: span var(--grid-item-span, 1);
    align-self: var(--layout-align);
    justify-self: var(--layout-justify);

    &[data-span='full'] {
      grid-column: 1 / -1;
    }

    & > :deep(*) {
      min-inline-size: 0;
    }
  }
}
</style>
