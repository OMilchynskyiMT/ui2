<template>
  <UiFormGrid :columns="1">
    <UiSectionHeader>
      Mail Log
      <template #actions>
        <UiButton size="small" tone="neutral" variant="tonal">
          <UiIcon :icon="RefreshCwIcon" size="1rem" />
          Refresh
        </UiButton>
        <UiButton size="small" tone="warning" variant="tonal">
          <UiIcon :icon="TrashIcon" size="1rem" />
          Purge
        </UiButton>
      </template>
    </UiSectionHeader>
    <UiTable v-model:sort="sort" :columns :rows="[]" />
  </UiFormGrid>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { RefreshCwIcon, TrashIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import { type TableColumn, type TableSort } from '@/lib/components/table/table.types'
import UiTable from '@/lib/components/table/UiTable.vue'
import UiIcon from '@/lib/components/UiIcon.vue'

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
