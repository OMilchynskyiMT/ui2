<template>
  <UiCard class="capacity-usage" padding="medium" variant="filled">
    <div class="header">
      <span aria-hidden="true" class="visual">
        <UiIcon :icon="icon" size="1.75rem" />
      </span>

      <span class="heading">
        <strong v-if="title" class="title">{{ title }}</strong>
        <span class="summary">{{ formattedUsed }} of {{ formattedTotal }}</span>
      </span>

      <strong class="percentage">{{ usedPercent }}%</strong>
    </div>

    <div
      role="meter"
      :aria-label="title ? `${title} usage` : 'Capacity usage'"
      :aria-valuemax="meterMaximum"
      :aria-valuenow="meterValue"
      :aria-valuetext="`${formattedUsed} used of ${formattedTotal}`"
      :title="`Total: ${formattedTotal}`"
      aria-valuemin="0"
      class="track"
    >
      <span
        v-for="segment in renderedSegments"
        :key="segment.key"
        :data-color-index="segment.colorIndex"
        :style="{ '--progress': `${segment.percent}%`, '--segment-color': segment.color }"
        :title="segment.meterTitle"
        class="segment"
      >
        <span v-if="segment.percent >= minimumLabelPercent">{{ Math.round(segment.percent) }}%</span>
      </span>
    </div>

    <div class="legend">
      <span
        v-for="segment in renderedSegments"
        :key="segment.key"
        :data-color-index="segment.colorIndex"
        :style="{ '--segment-color': segment.color }"
        :title="segment.hint"
        class="item"
      >
        <span aria-hidden="true" class="marker" />
        <span class="label">{{ segment.label }}</span>
        <strong class="value">{{ segment.formattedValue }}</strong>
      </span>
    </div>
  </UiCard>
</template>

<script lang="ts">
import type { Component } from 'vue'

export type CapacityUsageSegment = Readonly<{
  label: string
  value: number
  hint?: string
  color?: string
}>

export type CapacityUsageProperties = Readonly<{
  total: number
  segments: readonly CapacityUsageSegment[]
  title?: string
  icon?: Component
}>
</script>

<script lang="ts" setup>
import { computed } from 'vue'
import { HardDriveIcon } from '@lucide/vue'

import UiCard from '@/lib/components/section/UiCard.vue'
import UiIcon from '@/lib/components/UiIcon.vue'
import { formatBytes } from '@/lib/format/bytes'

const minimumLabelPercent = 2
const { total, segments, title, icon = HardDriveIcon } = defineProps<CapacityUsageProperties>()

const normalizedTotal = computed(() => (Number.isFinite(total) && total > 0 ? total : 0))
const meterMaximum = computed(() => Math.max(normalizedTotal.value, 1))

const renderedSegments = computed(() => {
  return segments.map((segment, index) => {
    const value = Number.isFinite(segment.value) && segment.value > 0 ? segment.value : 0
    const percent = normalizedTotal.value === 0 ? 0 : (value / normalizedTotal.value) * 100
    const formattedValue = formatBytes(value)
    const roundedPercent = Math.round(percent)

    return {
      ...segment,
      colorIndex: index % 3,
      key: `${index}-${segment.label}`,
      value,
      percent,
      formattedValue,
      meterTitle: `${segment.label}: ${formattedValue} (${roundedPercent}%)`,
    }
  })
})

const used = computed(() => renderedSegments.value.reduce((sum, segment) => sum + segment.value, 0))
const meterValue = computed(() => Math.min(used.value, normalizedTotal.value))
const usedPercent = computed(() => {
  if (normalizedTotal.value === 0) return 0
  return Math.min(Math.round((used.value / normalizedTotal.value) * 100), 100)
})
const formattedTotal = computed(() => formatBytes(normalizedTotal.value))
const formattedUsed = computed(() => formatBytes(used.value))
</script>

<style scoped>
@layer components {
  .capacity-usage {
    --track-height: clamp(12px, var(--font-size), 16px);
    --track-bg: oklch(from currentColor l c h / 0.03);

    --card-radius: var(--radius-xl);

    display: grid;
    gap: var(--space-md);

    & :is(.segment, .item) {
      &[data-color-index='0'] {
        --default-segment-color: light-dark(var(--blue-500), var(--blue-600));
      }

      &[data-color-index='1'] {
        --default-segment-color: light-dark(var(--orange-500), var(--orange-600));
      }

      &[data-color-index='2'] {
        --default-segment-color: light-dark(var(--indigo-500), var(--indigo-600));
      }
    }

    & > .header {
      min-inline-size: 0;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--space-md);

      & > .visual {
        inline-size: 3.25rem;
        block-size: 3.25rem;
        display: grid;
        place-items: center;
        border-radius: var(--radius-xl);
        background: color-mix(in oklch, var(--tone-primary) 14%, transparent);
        color: var(--tone-primary);
      }

      & > .heading {
        min-inline-size: 0;
        display: grid;
        gap: var(--space-xxs);

        & > .title {
          overflow: hidden;
          color: var(--text-color);
          font-size: var(--font-size-md);
          font-weight: var(--font-weight-semibold);
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        & > .summary {
          overflow: hidden;
          color: var(--text-color-dimmed);
          font-size: var(--font-size-sm);
          line-height: 1.25;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      & > .percentage {
        color: var(--tone-primary);
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
    }

    & > .track {
      position: relative;
      isolation: isolate;
      display: flex;
      inline-size: 100%;
      block-size: var(--track-height);
      border-radius: var(--radius-full);
      background: var(--track-bg);
      box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--text-color) 5%, transparent);

      & > .segment {
        --resolved-segment-color: var(--segment-color, var(--default-segment-color));

        z-index: 0;
        min-inline-size: 0;
        block-size: 100%;
        flex: 0 1 var(--progress);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: var(--resolved-segment-color);
        color: var(--white);
        font-size: var(--font-size-xxs);
        font-weight: var(--font-weight-semibold);
        font-variant-numeric: tabular-nums;
        line-height: 1;
        white-space: nowrap;
        transition-property: transform, opacity, filter, box-shadow;
        transition-duration: var(--duration-md);
        transition-timing-function: var(--bezier-smooth);

        &:first-child {
          border-start-start-radius: var(--radius-full);
          border-end-start-radius: var(--radius-full);
        }

        &:last-child {
          border-start-end-radius: var(--radius-full);
          border-end-end-radius: var(--radius-full);
        }
      }

      @media (hover: hover) {
        &:has(> .segment:hover) {
          & > .segment:not(:hover) {
            opacity: 0.55;
          }
        }

        & > .segment:hover {
          z-index: 1;
          overflow: visible;
          box-shadow: var(--shadow-sm);
          filter: saturate(1.08) brightness(1.04);
          transform: scaleY(1.28);
        }
      }
    }

    & > .legend {
      min-inline-size: 0;
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs) var(--space-lg);

      & > .item {
        --resolved-segment-color: var(--segment-color, var(--default-segment-color));

        min-inline-size: 0;
        display: inline-grid;
        grid-template-columns: auto auto auto;
        align-items: center;
        gap: var(--space-xs);
        color: var(--text-color-dimmed);
        font-size: var(--font-size-sm);
        line-height: 1.25;
        white-space: nowrap;

        & > .marker {
          inline-size: 0.5rem;
          block-size: 0.5rem;
          border-radius: var(--radius-full);
          background: var(--resolved-segment-color);
        }

        & > .label {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        & > .value {
          color: var(--text-color);
          font-weight: var(--font-weight-semibold);
          font-variant-numeric: tabular-nums;
        }
      }
    }

    @media (width < container-token(--container-sm)) {
      & > .header > .percentage {
        font-size: var(--font-size-lg);
      }

      & > .legend {
        display: grid;
        gap: var(--space-xs);

        & > .item {
          grid-template-columns: auto minmax(0, 1fr) auto;
        }
      }
    }
  }
}
</style>
