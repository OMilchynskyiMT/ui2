<template>
  <component :is="tag" :data-align="align" :style="{ '--stack-gap': gap }" class="stack">
    <slot />
  </component>
</template>

<script lang="ts">
export type UiStackProperties = {
  tag?: string
  align?: 'start' | 'center' | 'end' | 'stretch'
  gap?: string
}
</script>

<script lang="ts" setup>
const { tag = 'div', align = 'stretch', gap } = defineProps<UiStackProperties>()
</script>

<style scoped>
@layer components {
  .stack {
    min-inline-size: 0;
    display: grid;
    gap: var(--stack-gap, var(--space-sm));

    &[data-align='start'] {
      justify-items: start;
    }

    &[data-align='center'] {
      justify-items: center;
    }

    &[data-align='end'] {
      justify-items: end;
    }

    &[data-align='stretch'] {
      justify-items: stretch;
    }

    & > :deep(*) {
      min-inline-size: 0;
    }
  }
}
</style>
