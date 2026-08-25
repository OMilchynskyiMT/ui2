<template>
  <div
    role="progressbar"
    :aria-valuemax="indeterminate ? undefined : max"
    :aria-valuemin="indeterminate ? undefined : min"
    :aria-valuenow="summarizeValue"
    class="linear-progress"
  >
    <div v-if="indeterminate" class="indicator indeterminate" />
    <template v-else-if="typeof value === 'number'">
      <div :style="{ '--progress': `${progress(value)}%` }" class="indicator" />
    </template>
    <div
      v-for="(val, index) in value"
      v-else-if="typeof value === 'object'"
      :key="index"
      :style="{ '--progress': `${progress(val)}%`, '--indicator-color': colors?.[index], '--color-index': index }"
      class="indicator"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

type Properties = {
  value?: number | number[]
  min?: number
  max?: number
  colors?: string[]
}

const { value, min = 0, max = 100 } = defineProps<Properties>()

const progress = (value: number): number => {
  if (max <= min) return 0

  const clampedValue = Math.min(Math.max(value, min), max)
  return ((clampedValue - min) / (max - min)) * 100
}

const indeterminate = computed((): boolean => value === undefined)
const summarizeValue = computed((): number | undefined => {
  if (value === undefined || max <= min) return

  const total = typeof value === 'number' ? value : value.reduce((sum, item) => sum + item, 0)
  return Math.min(Math.max(total, min), max)
})
</script>

<style lang="css" scoped>
@layer components {
  .linear-progress {
    --accent: var(--blue-500);
    --height: 0.25rem;
    --radius: max(1px, var(--height) / 2);
    --progress-bg: color-mix(var(--accent) 20%, transparent);

    position: relative;
    width: 100%;
    height: var(--height);
    overflow: hidden;
    display: flex;
    border-radius: var(--radius);
    background: var(--progress-bg);

    & > .indicator {
      --generated-color: oklch(from var(--accent) l c calc(h + var(--color-index) * 137.508));

      width: var(--progress);
      height: 100%;
      background: var(--indicator-color, var(--generated-color));
      transition: width var(--duration-lg) ease;

      &:first-child {
        --generated-color: var(--accent);
        border-radius: var(--radius) 0 0 var(--radius);
      }
      &:last-child {
        border-radius: 0 var(--radius) var(--radius) 0;
      }

      &.indeterminate {
        position: absolute;
        width: 40%;
        animation: indeterminate var(--duration-3xl) ease-in-out infinite;
      }
    }
  }

  @keyframes indeterminate {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(350%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .linear-progress {
      > .indicator {
        transition: none;

        &.indeterminate {
          animation: none;
          width: 100%;
          opacity: 0.5;
        }
      }
    }
  }
}
</style>
