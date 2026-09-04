<template>
  <MTable
    v-model:sort="sort"
    :columns
    :loading
    :rows
    caption="Users"
    loading-label="Loading users..."
    mode="details"
    row-key="id"
    sticky-header
    style="--max-block-size: 30rem"
  >
    <template #cell-active="{ value }">
      {{ value ? 'Active' : 'Inactive' }}
    </template>
  </MTable>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import type { TableColumn, TableSort } from '@/lib/components/table/mtable.types'
import MTable from '@/lib/components/table/MTable.vue'

type User = {
  id: number
  name: string
  email: string
  active: boolean
  createdAt: string
}

const rows: User[] = [
  { id: 1, name: 'John Smith', email: 'john@example.com', active: true, createdAt: '2026-07-25' },
  { id: 2, name: 'Alice Walker', email: 'alice@example.com', active: false, createdAt: '2026-08-03' },
  { id: 3, name: 'Bob Stone', email: 'bob@example.com', active: true, createdAt: '2026-06-18' },
]

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
const loading = ref(true)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 3000)
})
</script>
