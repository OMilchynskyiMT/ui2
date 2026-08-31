<template>
  <div class="chart">
    <canvas ref="canvas" role="img" :aria-label="label" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onScopeDispose, ref, watch } from 'vue'

import { createChartRenderer } from './renderer'
import type { ChartDefinition, ChartLabel, ChartLabelFormatter, ChartValueFormatter } from './types'

type Properties = {
  chart: ChartDefinition
  label: string
  formatLabel?: ChartLabelFormatter
  formatValue?: ChartValueFormatter
}

const {
  chart,
  label,
  formatLabel: formatLabelFunction,
  formatValue: formatValueFunction,
} = defineProps<Properties>()

const canvas = ref<HTMLCanvasElement>()
let renderer: ReturnType<typeof createChartRenderer> | undefined

const formatLabel = (value: ChartLabel): string => {
  return formatLabelFunction?.(value) ?? String(value)
}

const formatValue = (value: number): string => {
  return formatValueFunction?.(value) ?? String(value)
}

onMounted(() => {
  if (!canvas.value) return
  renderer = createChartRenderer(canvas.value, chart, {
    formatLabel,
    formatValue,
  })
})

watch([() => chart, () => formatLabelFunction, () => formatValueFunction], () => renderer?.update(chart))
onScopeDispose(() => renderer?.destroy())
</script>

<style scoped>
.chart {
  position: relative;
  min-inline-size: 0;
  min-block-size: 0;

  canvas {
    display: block;
  }
}
</style>
