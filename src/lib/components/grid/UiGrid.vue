<template>
  <div :style="styles" class="grid-container">
    <div class="grid">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import type { LayoutAlign } from '../layout/layout.types'

export type UiGridColumns = {
  base?: number
  small?: number
  medium?: number
  large?: number
  extraLarge?: number
}

export type UiGridProperties = {
  columns?: UiGridColumns | number
  align?: LayoutAlign
  justify?: LayoutAlign
  gap?: string
  rowGap?: string
  columnGap?: string
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'

const { columns = 1, align = 'stretch', justify = 'stretch', gap, rowGap, columnGap } = defineProps<UiGridProperties>()

const normalizeColumns = (value: number | undefined): number | undefined => {
  if (value === undefined || !Number.isFinite(value)) return
  return Math.max(1, Math.trunc(value))
}

const styles = computed(() => {
  const responsive = typeof columns === 'number' ? undefined : columns
  const base = normalizeColumns(typeof columns === 'number' ? columns : responsive?.base) ?? 1
  const small = normalizeColumns(typeof columns === 'number' ? columns : responsive?.small)
  const medium = normalizeColumns(typeof columns === 'number' ? columns : responsive?.medium)
  const large = normalizeColumns(typeof columns === 'number' ? columns : responsive?.large)
  const extraLarge = normalizeColumns(typeof columns === 'number' ? columns : responsive?.extraLarge)

  return {
    '--grid-columns-base': base,
    '--grid-columns-sm': small,
    '--grid-columns-md': medium,
    '--grid-columns-lg': large,
    '--grid-columns-xl': extraLarge,
    '--grid-gap': gap,
    '--grid-row-gap': rowGap,
    '--grid-column-gap': columnGap,
    '--layout-align': align,
    '--layout-justify': justify,
  }
})
</script>

<style scoped>
@layer components {
  .grid-container {
    min-inline-size: 0;
    container-type: inline-size;
  }

  .grid {
    --grid-columns: var(--grid-columns-base, 1);

    min-inline-size: 0;
    display: grid;
    grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr));
    gap: var(--grid-row-gap, var(--grid-gap, var(--space-sm))) var(--grid-column-gap, var(--grid-gap, var(--space-sm)));
    align-items: var(--layout-align);
    justify-items: var(--layout-justify);

    & > :deep(*) {
      min-inline-size: 0;
    }
  }

  @container (min-width: container-token(--container-sm)) {
    .grid {
      --grid-columns: var(--grid-columns-sm, var(--grid-columns-base, 1));
    }
  }

  @container (min-width: container-token(--container-md)) {
    .grid {
      --grid-columns: var(--grid-columns-md, var(--grid-columns-sm, var(--grid-columns-base, 1)));
    }
  }

  @container (min-width: container-token(--container-lg)) {
    .grid {
      --grid-columns: var(
        --grid-columns-lg,
        var(--grid-columns-md, var(--grid-columns-sm, var(--grid-columns-base, 1)))
      );
    }
  }

  @container (min-width: container-token(--container-xl)) {
    .grid {
      --grid-columns: var(
        --grid-columns-xl,
        var(--grid-columns-lg, var(--grid-columns-md, var(--grid-columns-sm, var(--grid-columns-base, 1))))
      );
    }
  }
}
</style>
