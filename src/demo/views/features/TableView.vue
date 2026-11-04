<template>
  <UiStack gap="var(--space-xl)">
    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Sortable data with sticky headers and responsive detail-column behavior">
        Responsive table
      </UiSectionHeader>

      <UiTable
        v-model:page="page"
        v-model:page-size="pageSize"
        v-model:sort="sort"
        :columns
        :loading
        :rows
        caption="Users"
        loading-label="Loading users..."
        mode="details"
        pagination
        row-key="id"
        sticky-header
        style="--table-max-block-size: 30rem"
      >
        <template #cell-active="{ value }">
          {{ value ? 'Active' : 'Inactive' }}
        </template>
      </UiTable>
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import UiStack from '@/lib/components/layout/UiStack.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import type { TableColumn, TableSort } from '@/lib/components/table/table.types'
import UiTable from '@/lib/components/table/UiTable.vue'

type User = {
  id: number
  name: string
  email: string
  active: boolean
  createdAt: string
}

const rows: User[] = Array.from({ length: 45 }, (_, index) => ({
  id: index,
  name: `Demo user ${index}`,
  email: `user${index}@example.com`,
  active: index % 3 !== 0,
  createdAt: new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date()),
}))

const columns: TableColumn<User>[] = [
  {
    key: 'name',
    label: 'Name',
    value: 'name',
    rowHeader: true,
    sortable: true,
    minWidth: '12rem',
  },
  {
    key: 'email',
    label: 'Email',
    value: 'email',
    compact: 'details',
    minWidth: '16rem',
    sortable: true,
  },
  {
    key: 'active',
    label: 'Status',
    value: 'active',
    compact: 'keep',
    type: 'boolean',
    sortable: true,
  },
  {
    key: 'createdAt',
    label: 'Created',
    value: 'createdAt',
    type: 'date',
    align: 'end',
    sortable: true,
    compact: 'details',
  },
]

const sort = ref<TableSort | null>(null)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(true)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 3000)
})
</script>
