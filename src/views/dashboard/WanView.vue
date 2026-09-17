<template>
  <UiFormGrid :columns="1">
    <UiSectionHeader>WAN Configuration</UiSectionHeader>

    <UiFormGrid :columns="1">
      <UiCard>
        <UiFormGrid :columns="2">
          <div>Mode</div>
          <div><UiBadge size="large" tone="success">FAILOVER</UiBadge></div>
        </UiFormGrid>
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
          <UiIcon v-if="value" :icon="CheckIcon" :style="{ '--color': 'var(--green-500)' }" />
          <UiIcon v-else :icon="XIcon" :style="{ '--color': 'var(--red-500)' }" />
        </template>
      </UiTable>
    </UiFormGrid>
  </UiFormGrid>
</template>

<script lang="ts" setup>
import { CheckIcon, GripVerticalIcon, PencilIcon, XIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
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
