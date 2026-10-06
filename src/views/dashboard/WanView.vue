<template>
  <UiStack gap="var(--space-xxl)">
    <UiSectionHeader>WAN Configuration</UiSectionHeader>

    <UiStack gap="var(--space-xxl)">
      <UiCard>
        <UiGrid :columns="2" gap="var(--space-xxl)">
          <div>Mode</div>
          <div><UiBadge size="large" tone="success">FAILOVER</UiBadge></div>
        </UiGrid>
      </UiCard>

      <UiTable :columns="wanColumns" :rows="wanRows" caption="WANs" mode="scroll">
        <template #cell-drag>
          <UiIcon :icon="GripVerticalIcon" style="cursor: grab" />
        </template>

        <template #cell-actions>
          <UiButton :icon="PencilIcon" aria-label="Edit WAN" layout="icon" tone="neutral" variant="text" />
        </template>

        <template #cell-type="{ value }">
          <UiBadge tone="primary">{{ value }}</UiBadge>
        </template>

        <template #cell-status="{ value }">
          <UiIcon v-if="value" :icon="CheckIcon" :style="{ '--color': 'var(--icon-color-success)' }" />
          <UiIcon v-else :icon="XIcon" :style="{ '--color': 'var(--icon-color-danger)' }" />
        </template>
      </UiTable>
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import { CheckIcon, GripVerticalIcon, PencilIcon, XIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiGrid from '@/lib/components/grid/UiGrid.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import type { TableColumn } from '@/lib/components/table/table.types'
import UiTable from '@/lib/components/table/UiTable.vue'
import UiBadge from '@/lib/components/UiBadge.vue'
import UiIcon from '@/lib/components/UiIcon.vue'

type Wan = {
  status: boolean
  name: string
  type: string
}

const wanColumns: TableColumn<Wan>[] = [
  { key: 'drag', type: 'actions', label: '' },
  { key: 'status', label: 'State', sortable: true, width: '5rem' },
  { key: 'name', label: 'Name', sortable: true, rowHeader: true },
  { key: 'type', label: 'Type', sortable: true, compact: 'details' },
  { key: 'actions', label: 'Options', compact: 'keep', type: 'actions' },
]

const wanRows: Wan[] = [
  {
    status: true,
    name: 'eth0',
    type: 'ETHERNET',
  },
  {
    status: false,
    name: 'wlan0',
    type: 'WIFI',
  },
  {
    status: true,
    name: 'ppp0',
    type: 'CELLULAR',
  },
]
</script>
