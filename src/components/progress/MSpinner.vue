<template>
  <svg
    role="progressbar"
    :aria-valuenow="indeterminate ? undefined : normalizedValue"
    :class="{ indeterminate }"
    :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`"
    aria-valuemax="100"
    aria-valuemin="0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle v-if="showTrack" :cx="halfBoxSize" :cy="halfBoxSize" :r="radius" class="track" fill="none" />
    <circle
      :r="radius"
      :stroke-dashoffset="strokeDashOffset"
      class="progress"
      pathLength="100"
      stroke-dasharray="100"
    />
    <text v-if="value !== undefined" :x="halfBoxSize" :y="halfBoxSize">
      {{ normalizedValue }}
    </text>
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const {
  size = '3rem',
  fontSize = '1rem',
  strokeWidth = 2,
  value,
  indeterminate = false,
  showTrack = true,
} = defineProps<{
  size?: string
  fontSize?: string
  strokeWidth?: number
  value?: number
  indeterminate?: boolean
  showTrack?: boolean
}>()

const initialBoxSize = 48
const viewBoxSize = initialBoxSize + strokeWidth * 2
const halfBoxSize = viewBoxSize / 2
const radius = halfBoxSize - strokeWidth

const normalizedValue = computed(() => Math.min(100, Math.max(0, value ?? 0)))
const strokeDashOffset = computed(() => 100 - normalizedValue.value)
</script>

<style scoped>
svg {
  --size: var(--spinner-size, v-bind(size));
  --font-size: var(--spinner-font-size, v-bind(fontSize));
  --stroke-width: var(--spinner-stroke-width, v-bind(strokeWidth));
  --animation-speed: var(--spinner-animation-speed, 1.1s);

  position: relative;
  inline-size: var(--size);
  block-size: var(--size);
  display: inline-grid;
  place-items: center;

  shape-rendering: geometricPrecision;

  & > circle.track,
  & > circle.progress {
    stroke-width: var(--stroke-width);
    cx: 50%;
    cy: 50%;
    fill: none;
    stroke: currentColor;
  }

  & > circle.track {
    stroke: color-mix(in oklch, currentColor, transparent 90%);
  }

  & > circle.progress {
    transform: rotate(-90deg);
    transform-origin: center;
    stroke-linecap: square;

    transition-property: stroke-dashoffset, stroke-dasharray, stroke-width, transform;
    transition-duration: var(--duration-lg);
    transition-timing-function: var(--bezier-magnetic);
  }

  & > text {
    font-size: var(--font-size);
    opacity: var(--opacity, 1);
    transition: opacity var(--duration-md);
    dominant-baseline: central;
    text-anchor: middle;
    fill: currentColor;
  }

  &.indeterminate {
    transition: none;

    & > circle.progress {
      animation:
        spinner-rotate var(--animation-speed) linear infinite,
        spinner-dash calc(var(--animation-speed) * 1.2) cubic-bezier(0.35, 0, 0.25, 1) infinite;
    }
    & > text {
      --opacity: 0;
    }
  }
}

@keyframes spinner-rotate {
  to {
    transform: rotate(270deg);
  }
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 1 100;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 68 100;
    stroke-dashoffset: -22;
  }

  100% {
    stroke-dasharray: 1 100;
    stroke-dashoffset: -99;
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
