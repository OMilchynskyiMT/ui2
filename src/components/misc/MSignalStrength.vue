<template>
  <svg
    ref="svg"
    role="meter"
    :aria-label="title ?? 'Signal strength'"
    :aria-valuemax="computedSteps"
    :aria-valuenow="computedLevel"
    :height
    :viewBox="`0 0 ${width} ${height}`"
    :width
    aria-valuemin="0"
    class="signal-strength"
  >
    <title v-if="title">{{ title }}</title>
    <rect
      v-for="(_, index) in computedSteps"
      :key="index"
      :class="{ active: index < computedLevel }"
      :height="getBarHeight(index)"
      :width="barWidth"
      :x="getBarX(index)"
      :y="getBarY(index)"
      class="indicator"
    />
  </svg>
</template>

<script lang="ts" setup>
import { computed, useTemplateRef } from 'vue'

import { useElementDevicePixelSize } from '@/composables/useDeviceHardwareHelpers'

const {
  level = 0,
  steps = 3,
  title,
} = defineProps<{
  level?: number
  steps?: number
  title?: string
}>()

const BAR_WIDTH = 3
const BAR_GAP = 2
const MIN_BAR_HEIGHT = 3
const BAR_HEIGHT_STEP = 3

const svg = useTemplateRef<SVGSVGElement>('svg')
const devicePixelSize = useElementDevicePixelSize(svg)

const computedSteps = computed(() => {
  return Math.max(1, Math.trunc(steps))
})

const computedLevel = computed(() => {
  return Math.min(computedSteps.value, Math.max(0, Math.trunc(level)))
})

const baseHeight = computed(() => {
  return MIN_BAR_HEIGHT + (computedSteps.value - 1) * BAR_HEIGHT_STEP
})

const height = computed(() => {
  return devicePixelSize.value.blockSize || baseHeight.value
})

const barWidth = computed(() => {
  return Math.max(1, Math.round((height.value * BAR_WIDTH) / baseHeight.value))
})

const barGap = computed(() => {
  return Math.max(1, Math.round((height.value * BAR_GAP) / baseHeight.value))
})

const width = computed(() => {
  return computedSteps.value * barWidth.value + (computedSteps.value - 1) * barGap.value
})

const getBarHeight = (index: number): number => {
  const baseBarHeight = MIN_BAR_HEIGHT + index * BAR_HEIGHT_STEP

  return Math.max(1, Math.round((height.value * baseBarHeight) / baseHeight.value))
}

const getBarX = (index: number): number => {
  return index * (barWidth.value + barGap.value)
}

const getBarY = (index: number): number => {
  return height.value - getBarHeight(index)
}
</script>

<style scoped>
.signal-strength {
  --size: 1.25rem;
  --level-opacity: 0.2;

  display: block;
  block-size: var(--size);
  inline-size: auto;
  overflow: visible;
  color: var(--color, inherit);

  .indicator {
    fill: currentColor;
    opacity: var(--level-opacity);
    transition: opacity var(--duration-lg) var(--bezier-smooth);

    &.active {
      --level-opacity: 1;
    }
  }
}
</style>
