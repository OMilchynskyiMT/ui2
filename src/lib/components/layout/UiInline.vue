<template>
  <component
    :is="tag"
    :style="{
      '--layout-align': align,
      '--layout-justify': resolveLayoutJustify(justify),
      '--inline-gap': gap,
    }"
    class="inline"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import type { InlineLayoutAlign, LayoutJustify } from './layout.types'

export type UiInlineProperties = {
  tag?: string
  align?: InlineLayoutAlign
  justify?: LayoutJustify
  gap?: string
}
</script>

<script lang="ts" setup>
import { resolveLayoutJustify } from './layout.types'

const { tag = 'div', align = 'center', justify = 'start', gap } = defineProps<UiInlineProperties>()
</script>

<style scoped>
@layer components {
  .inline {
    min-inline-size: 0;
    max-inline-size: 100%;
    display: flex;
    flex-wrap: nowrap;
    gap: var(--inline-gap, var(--space-sm));
    align-items: var(--layout-align);
    justify-content: var(--layout-justify);

    & > :deep(*) {
      min-inline-size: 0;
    }
  }
}
</style>
