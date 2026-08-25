<template>
  <MFormGrid :columns="1">
    <MSectionHeader>
      Mail Log
      <template #actions>
        <MButton tone="neutral" size="small" variant="tonal">
          <MIcon :icon="RefreshCwIcon" size="1rem" />
          Refresh
        </MButton>
        <MButton tone="warning" size="small" variant="tonal">
          <MIcon :icon="TrashIcon" size="1rem" />
          Purge
        </MButton>
      </template>
    </MSectionHeader>
    <MTable v-model:sort="sort" :columns :rows="[]" />
  </MFormGrid>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { RefreshCwIcon, TrashIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MFormGrid from '@/lib/components/grid/MFormGrid.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'
import { type TableColumn, type TableSort } from '@/lib/components/table/mtable.types'
import MTable from '@/lib/components/table/MTable.vue'

type Log = {
  date: string
  recipient: string
  status: string
}

const columns: TableColumn<Log>[] = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'recipient', label: 'Recipient', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Options', compact: 'keep', type: 'actions' },
]
const sort = ref<TableSort | null>(null)
</script>
