<template>
  <div :style="styles" class="outer">
    <div class="grid"><slot /></div>
  </div>
</template>

<script lang="ts">
export type Columns = {
  small?: number
  medium?: number
  large?: number
  extraLarge?: number
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'

const { columns = { small: 1, medium: 2 } } = defineProps<{
  columns?: Columns | number
}>()

const styles = computed(() =>
  typeof columns === 'number'
    ? {
        '--columns-sm': columns,
        '--columns-md': columns,
        '--columns-lg': columns,
        '--columns-xl': columns,
      }
    : {
        '--columns-sm': columns.small ?? 1,
        '--columns-md': columns.medium,
        '--columns-lg': columns.large,
        '--columns-xl': columns.extraLarge,
      }
)
</script>

<style scoped>
@layer components {
  div.outer {
    --row-gap: var(--space-xxl);
    --column-gap: var(--space-xxl);

    max-inline-size: min(100%, var(--container-xl));
    container-type: inline-size;

    & > div.grid {
      --grid-columns: var(--columns-sm, 1);

      display: grid;
      grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr));
      place-items: start;
      align-items: start;
      justify-items: stretch;
      gap: var(--row-gap) var(--column-gap);
    }

    @container (min-width: container-token(--container-md)) {
      div.grid {
        --grid-columns: var(--columns-md, var(--columns-sm, 1));
      }
    }

    @container (min-width: container-token(--container-lg)) {
      div.grid {
        --grid-columns: var(--columns-lg, var(--columns-md, var(--columns-sm, 1)));
      }
    }

    @container (min-width: container-token(--container-xl)) {
      div.grid {
        --grid-columns: var(--columns-xl, var(--columns-lg, var(--columns-md, var(--columns-sm, 1))));
      }
    }
  }
}
</style>