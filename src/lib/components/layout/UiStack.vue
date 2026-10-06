<template>
  <component
    :is="tag"
    :style="{
      '--layout-align': align,
      '--layout-justify': resolveLayoutJustify(justify),
      '--stack-gap': gap,
    }"
    class="stack"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import type { LayoutAlign, LayoutJustify } from './layout.types'

export type UiStackProperties = {
  tag?: string
  align?: LayoutAlign
  justify?: LayoutJustify
  gap?: string
}
</script>

<script lang="ts" setup>
import { resolveLayoutJustify } from './layout.types'

const { tag = 'div', align = 'stretch', justify = 'start', gap } = defineProps<UiStackProperties>()
</script>

<style scoped>
@layer components {
  .stack {
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: var(--stack-gap, var(--space-sm));
    align-items: var(--layout-align);
    justify-content: var(--layout-justify);

    & > :deep(*) {
      min-inline-size: 0;
    }
  }
}
</style>
