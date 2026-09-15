<template>
  <div class="charts-view">
    <section>
      <UiSectionHeader description="Responsive bar chart with application-owned data and formatters">
        Network traffic
      </UiSectionHeader>

      <div class="chart">
        <Chart
          :chart="trafficChart"
          :format-label="formatDate"
          :format-value="formatTrafficBytes"
          label="Received and transmitted network traffic by day"
        />
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import { formatBytes } from '@/lib/format/bytes'
import { Chart } from '@/components/chart'
import type { ChartDefinition, ChartLabel } from '@/components/chart/types'

const raw: { label: string; rx: number; tx: number }[] = []
const now = new Date()
const initialDate = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())

while (initialDate <= now) {
  raw.push({
    label: initialDate.toLocaleDateString(),
    rx: Math.floor(Math.random() * 100_000_000),
    tx: Math.floor(Math.random() * 100_000_000),
  })

  initialDate.setDate(initialDate.getDate() + 1)
}

const trafficChart: ChartDefinition = {
  type: 'bar',
  labels: raw.map(({ label }) => label),
  series: [
    {
      id: 'received',
      label: 'Received',
      values: raw.map(({ rx }) => rx),
      color: '--orange-400',
    },
    {
      id: 'transmitted',
      label: 'Transmitted',
      values: raw.map(({ tx }) => tx),
      color: '--cyan-500',
    },
  ],
}

const formatDate = (value: ChartLabel): string => {
  if (typeof value !== 'number') return value

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(value)
}

const formatTrafficBytes = (value: number): string => formatBytes(value, { unitSystem: 'decimal' })
</script>

<style scoped>
.charts-view > section {
  min-inline-size: 0;
  display: grid;
  gap: var(--space-xl);
}

.chart {
  inline-size: min(100%, var(--container-xl));
  block-size: clamp(16rem, 50vw, 24rem);
}
</style>
