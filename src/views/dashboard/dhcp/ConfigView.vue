<template>
  <div style="display: grid; gap: var(--space-xl)">
    <MTable
      v-model:sort="sortV4"
      :columns="dhcpV4Columns"
      :loading
      :rows="dhcpV4Rows"
      caption="IPv4 DHCP Servers"
      mode="details"
      row-key="interface"
    >
      <template #cell-status="{ value }">
        <MIcon v-if="value" :icon="CheckIcon" :style="{ '--color': 'var(--green-500)' }" />
        <MIcon v-else :icon="XIcon" :style="{ '--color': 'var(--red-500)' }" />
      </template>

      <template #cell-actions>
        <MButton tone="neutral" variant="icon"><MIcon :icon="PencilIcon" /></MButton>
        <MButton tone="warning" variant="icon" @click="confirmDeleteDialog?.confirm">
          <MIcon :icon="TrashIcon" />
        </MButton>
      </template>
    </MTable>

    <MTable
      v-model:sort="sortV6"
      :columns="dhcpV6Columns"
      :loading
      :rows="dhcpV6Rows"
      caption="DHCPv6 and Router Advertisement"
      mode="scroll"
      row-key="interface"
    >
      <template #cell-status="{ value }">
        <MIcon v-if="value" :icon="CheckIcon" :style="{ '--color': 'var(--green-500)' }" />
        <MIcon v-else :icon="XIcon" :style="{ '--color': 'var(--red-500)' }" />
      </template>

      <template #cell-raMode="{ value }">
        <MChip tone="success">{{ value }}</MChip>
      </template>

      <template #cell-actions>
        <MButton tone="neutral" variant="icon"><MIcon :icon="PencilIcon" /></MButton>
        <MButton tone="warning" variant="icon" @click="confirmDeleteDialog?.confirm">
          <MIcon :icon="TrashIcon" />
        </MButton>
      </template>
    </MTable>

    <MConfirmDialog ref="confirm-delete-dialog" accept-text="Remove">
      Are you sure you want to remove this DHCP server?
    </MConfirmDialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, useTemplateRef } from 'vue'
import { CheckIcon, PencilIcon, TrashIcon, XIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MConfirmDialog, { type Exposed as ConfirmExposed } from '@/lib/components/dialog/MConfirmDialog.vue'
import MChip from '@/lib/components/MChip.vue'
import MIcon from '@/lib/components/MIcon.vue'
import type { TableColumn, TableSort } from '@/lib/components/table/mtable.types'
import MTable from '@/lib/components/table/MTable.vue'

type DhcpV4 = {
  status: boolean
  interface: string
  gateway: string
  domain?: string
  leaseStart: string
  leaseEnd: string
}

type Dhcpv6 = {
  status: boolean
  interface: string
  raMode: string
  leaseTime: string
}

const dhcpV4Columns: TableColumn<DhcpV4>[] = [
  { key: 'status', label: 'Status', sortable: true, width: '5rem' },
  { key: 'interface', label: 'Interface', sortable: true, rowHeader: true },
  { key: 'gateway', label: 'Gateway', sortable: true, compact: 'details' },
  { key: 'domain', label: 'Domain', sortable: true, compact: 'details' },
  { key: 'leaseStart', label: 'Lease Start', sortable: true, compact: 'details' },
  { key: 'leaseEnd', label: 'Lease End', sortable: true, compact: 'details' },
  { key: 'actions', label: 'Options', compact: 'keep', type: 'actions' },
]

const dhcpV6Columns: TableColumn<Dhcpv6>[] = [
  { key: 'status', label: 'Status', sortable: true, width: '5rem' },
  { key: 'interface', label: 'Interface', sortable: true, rowHeader: true },
  { key: 'raMode', label: 'RA Mode', sortable: true },
  { key: 'leaseTime', label: 'Lease Time', sortable: true },
  { key: 'actions', label: 'Options', compact: 'keep', type: 'actions' },
]

const dhcpV4Rows: DhcpV4[] = [
  {
    status: true,
    interface: 'br0',
    gateway: '192.168.2.1',
    domain: 'example.com',
    leaseStart: '192.168.2.100',
    leaseEnd: '192.168.2.200',
  },
  {
    status: false,
    interface: 'eth1',
    gateway: '192.168.20.10',
    domain: '',
    leaseStart: '192.168.20.100',
    leaseEnd: '192.168.20.200',
  },
]

const dhcpV6Rows: Dhcpv6[] = [
  {
    status: true,
    interface: 'br0',
    raMode: 'STATELESS',
    leaseTime: '01-00-00',
  },
  {
    status: false,
    interface: 'eth1',
    raMode: 'STATELESS',
    leaseTime: '01-00-00',
  },
]

const sortV4 = ref<TableSort | null>(null)
const sortV6 = ref<TableSort | null>(null)
const loading = ref(true)
const confirmDeleteDialog = useTemplateRef<ConfirmExposed>('confirm-delete-dialog')

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 3000)
})
</script>
