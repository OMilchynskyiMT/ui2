<template>
  <UiStack class="gps-position-map" gap="var(--space-lg)">
    <svg
      role="img"
      :aria-label="point ? 'World map showing device GPS position' : 'World map with no current GPS position'"
      class="world-map"
      viewBox="0 0 960 480"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>
        {{
          point
            ? `Device position: ${coordinates.latitude}, ${coordinates.longitude}`
            : 'World map: position unavailable'
        }}
      </title>
      <rect class="ocean" height="480" width="960" />
      <g aria-hidden="true" class="graticule">
        <path v-for="x in meridians" :key="`meridian-${x}`" :d="`M ${x} 0 V 480`" />
        <path v-for="y in parallels" :key="`parallel-${y}`" :d="`M 0 ${y} H 960`" />
      </g>
      <path :d="landPath" class="land" fill-rule="evenodd" />
      <g
        v-for="marker in markers"
        :key="marker.x"
        :transform="`translate(${marker.x} ${marker.y})`"
        aria-hidden="true"
        class="position-marker"
      >
        <circle class="marker-halo" r="40" />
        <circle class="marker-ring" r="8" />
        <circle class="marker-center" r="3" />
      </g>
    </svg>

    <UiPropertyList v-if="point" :data="coordinates" :items="coordinateItems" />
    <UiAlert v-else tone="warning">
      {{ hasFix ? 'No valid GPS coordinates are available.' : 'No GPS fix. Check the receiver and antenna.' }}
    </UiAlert>
  </UiStack>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import UiStack from '@/lib/components/layout/UiStack.vue'
import UiPropertyList, { type Item } from '@/lib/components/list/UiPropertyList.vue'
import UiAlert from '@/lib/components/status/UiAlert.vue'
import landPath from '@/assets/maps/world-land.path?raw'
import { formatGpsCoordinate, type GpsPosition, isValidGpsPosition, projectGpsPosition } from '@/models/gps/coordinates'

const { position, hasFix = true } = defineProps<{
  position?: GpsPosition | null
  hasFix?: boolean
}>()

const meridians = [80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880]
const parallels = [80, 160, 240, 320, 400]

const point = computed(() => (hasFix && isValidGpsPosition(position) ? projectGpsPosition(position) : null))
// repeat the marker across the map seam so +-180deg remains visible on both edges
const markers = computed(() => {
  if (!point.value) return []
  const { x, y } = point.value
  return [{ x, y }, ...(x < 19 ? [{ x: x + 960, y }] : []), ...(x > 941 ? [{ x: x - 960, y }] : [])]
})

const coordinates = computed(() => ({
  latitude: position && point.value ? formatGpsCoordinate(position.lat, 'latitude') : '',
  longitude: position && point.value ? formatGpsCoordinate(position.lng, 'longitude') : '',
}))

const coordinateItems = [
  { field: 'latitude', label: 'Latitude' },
  { field: 'longitude', label: 'Longitude' },
] satisfies readonly Item<typeof coordinates.value>[]
</script>

<style scoped>
@layer components {
  .gps-position-map {
    --ocean-fill: color-mix(in oklab, var(--tone-primary) 6%, var(--surface-container-low));
    --land-fill: color-mix(in oklab, var(--tone-primary) 26%, var(--surface-container-low));
    --land-stroke-color: color-mix(in oklab, var(--tone-primary) 50%, transparent);
    --graticule-color: color-mix(in oklab, var(--divider-color) 50%, transparent);
    --marker-color: var(--tone-primary);
    --marker-halo-color: color-mix(in oklab, var(--marker-color) 20%, transparent);
    --marker-ring-color: var(--marker-color);
    --marker-center-color: var(--marker-color);

    min-inline-size: 0;

    & .world-map {
      display: block;
      inline-size: 100%;
      aspect-ratio: 2 / 1;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--surface-container-low);

      & .ocean {
        fill: var(--ocean-fill);
      }

      & .graticule {
        stroke: var(--graticule-color);
        stroke-width: 0.5;
      }

      & .land {
        fill: var(--land-fill);
        stroke: var(--land-stroke-color);
        stroke-width: 0.25;
      }

      & .position-marker {
        --marker-pulse-duration: 3.25s;

        & .marker-halo {
          fill: var(--marker-halo-color);
          opacity: 0;
          transform-origin: 0 0;
          transform: scale(0);
          animation: marker-halo var(--marker-pulse-duration) linear infinite;
        }

        & .marker-ring {
          fill: var(--surface-container-low);
          stroke: var(--marker-ring-color);
          stroke-width: 1;
          animation: marker-ring var(--marker-pulse-duration) linear infinite;
        }

        & .marker-center {
          fill: var(--marker-center-color);
          animation: marker-center var(--marker-pulse-duration) linear infinite;
        }
      }
    }
  }

  @keyframes marker-halo {
    0% {
      transform: scale(0);
      opacity: 0.4;
    }

    65% {
      transform: scale(0.75);
      opacity: 0.2;
    }

    80% {
      opacity: 0;
    }

    100% {
      transform: scale(1);
    }
  }

  @keyframes marker-ring {
    0% {
      r: 8px;
      opacity: 1;
    }

    15% {
      r: 5px;
      opacity: 0;
    }

    100% {
      r: 1px;
      opacity: 0;
    }
  }

  @keyframes marker-center {
    0% {
      fill: var(--data-color-1);
      r: 3px;
      opacity: 1;
    }

    25% {
      fill: var(--marker-center-color);
      r: 3px;
    }

    100% {
      r: 1.5px;
      opacity: 0.33;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gps-position-map .world-map .position-marker {
      & .marker-halo,
      & .marker-ring,
      & .marker-center {
        animation: none;
      }
    }
  }
}
</style>
