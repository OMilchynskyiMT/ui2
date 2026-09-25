<template>
  <UiCard class="traffic-overview" padding="medium" variant="filled">
    <UiStack gap="var(--space-md)">
      <DashboardCardHeader :icon="ArrowDownUpIcon" eyebrow="Received and transmitted traffic" title="Network traffic">
        <template v-if="period" #actions>
          <UiChip :label="period" size="small" tone="neutral" variant="tonal" />
        </template>
      </DashboardCardHeader>

      <div class="chart">
        <Chart :chart :format-label :format-value :label />
      </div>
    </UiStack>
  </UiCard>
</template>

<script lang="ts" setup>
import { ArrowDownUpIcon } from '@lucide/vue'

import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiChip from '@/lib/components/UiChip.vue'
import { Chart } from '@/components/chart'
import type { ChartDefinition, ChartLabelFormatter, ChartValueFormatter } from '@/components/chart/types'
import DashboardCardHeader from '@/components/dashboard/DashboardCardHeader.vue'

const { chart, label, period, formatLabel, formatValue } = defineProps<{
  chart: ChartDefinition
  label: string
  period?: string
  formatLabel?: ChartLabelFormatter
  formatValue?: ChartValueFormatter
}>()
</script>

<style scoped>
@layer components {
  .traffic-overview {
    min-inline-size: 0;

    & .chart {
      min-inline-size: 0;
      block-size: 10.5rem;
    }

    @media (width < container-token(--container-sm)) {
      & .chart {
        block-size: 9rem;
      }
    }
  }
}
</style>
