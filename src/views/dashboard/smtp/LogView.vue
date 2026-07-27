<template>
  <MFormGrid :columns="1">
    <MCaption>
      Mail Log
      <template #actions>
        <MButton kind="neutral" size="small" variant="tonal">
          <MIcon :icon="RefreshCwIcon" size="1rem" />
          Refresh
        </MButton>
        <MButton kind="attention" size="small" variant="tonal">
          <MIcon :icon="TrashIcon" size="1rem" />
          Purge
        </MButton>
      </template>
    </MCaption>
    <MTable v-model:sort="sort" :columns :rows="[]" />
  </MFormGrid>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { RefreshCwIcon, TrashIcon } from '@lucide/vue'

import MButton from '@/components/buttons/MButton.vue'
import MFormGrid from '@/components/grid/MFormGrid.vue'
import MIcon from '@/components/MIcon.vue'
import MCaption from '@/components/section/MCaption.vue'
import { type TableColumn, type TableSort } from '@/components/table/mtable.types'
import MTable from '@/components/table/MTable.vue'

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