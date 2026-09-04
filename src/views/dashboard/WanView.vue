<template>
  <MFormGrid :columns="1">
    <MSectionHeader>WAN Configuration</MSectionHeader>

    <MFormGrid :columns="1">
      <MCard>
        <MFormGrid :columns="2">
          <div>Mode</div>
          <div><MChip size="large" tone="success">FAILOVER</MChip></div>
        </MFormGrid>
      </MCard>

      <MTable :columns="wanColumns" :rows="wanRows" caption="WANs" mode="scroll">
        <template #cell-drag>
          <MIcon :icon="GripVerticalIcon" style="cursor: grab" />
        </template>

        <template #cell-actions>
          <MButton aria-label="Edit WAN" tone="neutral" variant="icon">
            <MIcon :icon="PencilIcon" />
          </MButton>
        </template>

        <template #cell-type="{ value }">
          <MChip tone="primary">{{ value }}</MChip>
        </template>

        <template #cell-status="{ value }">
          <MIcon v-if="value" :icon="CheckIcon" :style="{ '--color': 'var(--green-500)' }" />
          <MIcon v-else :icon="XIcon" :style="{ '--color': 'var(--red-500)' }" />
        </template>
      </MTable>
    </MFormGrid>
  </MFormGrid>
</template>

<script lang="ts" setup>
import { CheckIcon, GripVerticalIcon, PencilIcon, XIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MFormGrid from '@/lib/components/grid/MFormGrid.vue'
import MChip from '@/lib/components/MChip.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MCard from '@/lib/components/section/MCard.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'
import type { TableColumn } from '@/lib/components/table/mtable.types'
import MTable from '@/lib/components/table/MTable.vue'

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
