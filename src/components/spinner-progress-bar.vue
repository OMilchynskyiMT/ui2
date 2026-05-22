<template>
  <svg
    ref="svg"
    role="progressbar"
    :aria-valuenow="indeterminate ? undefined : normalizedValue"
    :class="{ indeterminate }"
    :height="size"
    :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`"
    :width="size"
    aria-valuemax="100"
    aria-valuemin="0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      v-if="showTrack"
      :cx="halfBoxSize"
      :cy="halfBoxSize"
      :r="halfBoxSize - strokeWidth / 2"
      :stroke-width="strokeWidth"
      class="track"
      fill="none"
    />
    <circle
      :cx="halfBoxSize"
      :cy="halfBoxSize"
      :r="halfBoxSize - strokeWidth / 2"
      :stroke-dashoffset="strokeDashOffset"
      :stroke-width="strokeWidth"
      class="progress"
      fill="none"
      pathLength="100"
      stroke="currentColor"
      stroke-dasharray="100"
    />
    <text
      :x="halfBoxSize"
      :y="(viewBoxSize + strokeWidth) / 2"
      dominant-baseline="middle"
      fill="currentColor"
      font-size="1rem"
      text-anchor="middle"
    >
      {{ normalizedValue }}
    </text>
  </svg>
</template>

<script lang="ts" setup>
import { computed, onMounted, useTemplateRef, watch } from 'vue'

const svg = useTemplateRef<SVGElement>('svg')
const viewBoxSize = 48
const halfBoxSize = viewBoxSize / 2
const {
  size = '3rem',
  strokeWidth = 2,
  value,
  indeterminate = false,
  showTrack = true,
} = defineProps<{
  size?: string
  strokeWidth?: number
  value?: number
  indeterminate?: boolean
  showTrack?: boolean
}>()

const normalizedValue = computed(() => Math.min(100, Math.max(0, value ?? 0)))
const strokeDashOffset = computed(() => 100 - normalizedValue.value)

const syncSize = () => svg.value?.style.setProperty('--size', size)
watch(() => size, syncSize)
onMounted(syncSize)
</script>

<style scoped>
svg {
  position: relative;
  inline-size: var(--size);
  block-size: var(--size);
  display: inline-grid;
  place-items: center;

  &.indeterminate {
    & > circle.progress {
      animation-name: spinner-rotate, spinner-dash;
      animation-timing-function: var(--bezier-smooth);
      animation-duration: 1.5s;
      animation-iteration-count: infinite;
    }
    & > text {
      --opacity: 0;
    }
  }

  & > circle.track {
    stroke: color-mix(in oklch, currentColor, transparent 90%);
  }

  & > circle.progress {
    transition-property: stroke-dashoffset, stroke-dasharray, stroke-width, transform;
    transition-duration: var(--duration-lg);
    transition-timing-function: var(--bezier-magnetic);
    will-change: stroke-dashoffset, stroke-dasharray, transform;

    transform: rotate(-90deg);
    transform-origin: center;
  }

  & > text {
    opacity: var(--opacity, 1);
    transition: opacity var(--duration-md);
  }
}

@keyframes spinner-rotate {
  to {
    transform: rotate(270deg);
  }
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 0 100;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 85 100;
    stroke-dashoffset: -15;
  }

  100% {
    stroke-dasharray: 0 100;
    stroke-dashoffset: -100;
  }
}

@media (prefers-reduced-motion: reduce) {
  svg {
    & > text {
      transition: none;
    }

    & > circle.progress {
      animation: none;
      transition: none;
    }
  }
}
</style>
