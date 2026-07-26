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

import type { TableColumn, TableSort } from '@/components/table/mtable.types'
import MTable from '@/components/table/MTable.vue'

type User = {
  id: number
  name: string
  email: string
  active: boolean
  createdAt: string
}

const rows: User[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    active: true,
    createdAt: '2026-07-25',
  },
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
  },
  {
    key: 'active',
    label: 'Status',
    value: 'active',
    compact: 'keep',
  },
  {
    key: 'createdAt',
    label: 'Created',
    value: 'createdAt',
    type: 'date',
    align: 'end',
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
