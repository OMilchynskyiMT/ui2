<template>
  <div
    role="progressbar"
    :aria-valuemax="indeterminate ? undefined : normalizedMax"
    :aria-valuemin="indeterminate ? undefined : min"
    :aria-valuenow="summarizedValue"
    class="linear-progress"
  >
    <div v-if="indeterminate" class="indicator indeterminate" />
    <div v-else-if="typeof value === 'number'" :style="{ '--progress': `${progress(value)}%` }" class="indicator" />
    <div
      v-for="(segment, index) in normalizedSegments"
      v-else
      :key="index"
      :style="{
        '--progress': `${segment.percentage}%`,
        '--indicator-color': colors?.[index],
        '--color-index': index,
      }"
      class="indicator"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

type Properties = {
  /**
   * A number is an absolute value in the [min, max] range.
   * An array represents ordered segment amounts that consume the available
   * range (max - min). Segments are clamped in order and never flex-shrunk.
   */
  value?: number | readonly number[]
  min?: number
  max?: number
  colors?: readonly string[]
}

type NormalizedSegment = Readonly<{
  amount: number
  percentage: number
}>

const { value, min = 0, max = 100 } = defineProps<Properties>()

const normalizedMax = computed(() => Math.max(min, max))
const range = computed(() => normalizedMax.value - min)
const indeterminate = computed((): boolean => value === undefined)

const progress = (currentValue: number): number => {
  if (range.value <= 0) return 0

  const clampedValue = Math.min(Math.max(currentValue, min), normalizedMax.value)
  return ((clampedValue - min) / range.value) * 100
}

const normalizedSegments = computed<readonly NormalizedSegment[]>(() => {
  if (!Array.isArray(value) || range.value <= 0) return []

  let remaining = range.value
  return value.map(segment => {
    const amount = Math.min(Math.max(segment, 0), remaining)
    remaining -= amount

    return {
      amount,
      percentage: (amount / range.value) * 100,
    }
  })
})

const summarizedValue = computed((): number | undefined => {
  if (value === undefined || range.value <= 0) return
  if (typeof value === 'number') return Math.min(Math.max(value, min), normalizedMax.value)

  const total = normalizedSegments.value.reduce((sum, segment) => sum + segment.amount, 0)
  return min + total
})
</script>

<style lang="css" scoped>
@layer components {
  .linear-progress {
    --accent: var(--blue-500);
    --height: 0.25rem;
    --radius: max(1px, var(--height) / 2);
    --progress-bg: color-mix(in oklch, var(--accent) 20%, transparent);

    position: relative;
    width: 100%;
    height: var(--height);
    overflow: hidden;
    display: flex;
    border-radius: var(--radius);
    background: var(--progress-bg);

    & > .indicator {
      --generated-color: oklch(from var(--accent) l c calc(h + var(--color-index) * 137.508));

      flex: 0 0 var(--progress);
      min-inline-size: 0;
      height: 100%;
      background: var(--indicator-color, var(--generated-color));
      transition: flex-basis var(--duration-lg) ease;

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
