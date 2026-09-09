<template>
  <div class="charts-view">
    <section>
      <MSectionHeader description="Responsive bar chart with application-owned data and formatters">
        Network traffic
      </MSectionHeader>

      <div class="chart">
        <MChart
          :chart="trafficChart"
          :format-label="formatDate"
          :format-value="formatBytes"
          label="Received and transmitted network traffic by day"
        />
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'
import { MChart } from '@/components/chart'
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

const formatBytes = (value: number): string => {
  if (value === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const unit = Math.min(Math.floor(Math.log(value) / Math.log(1000)), units.length - 1)
  const size = value / 1000 ** unit

  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(size)} ${units[unit]}`
}
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
