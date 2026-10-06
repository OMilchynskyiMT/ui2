<template>
  <UiStack gap="var(--space-xxl)">
    <UiSectionHeader>
      Mail Log
      <template #actions>
        <UiButton :icon="RefreshCwIcon" size="small" tone="neutral" variant="tonal">Refresh</UiButton>
        <UiButton :icon="TrashIcon" size="small" tone="warning" variant="tonal">Purge</UiButton>
      </template>
    </UiSectionHeader>
    <UiTable v-model:sort="sort" :columns :rows="[]" />
  </UiStack>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { RefreshCwIcon, TrashIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import { type TableColumn, type TableSort } from '@/lib/components/table/table.types'
import UiTable from '@/lib/components/table/UiTable.vue'

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
