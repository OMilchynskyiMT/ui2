<template>
  <UiCard class="network-bridge" padding="medium">
    <UiStack gap="var(--space-lg)">
      <DashboardCardHeader :icon="NetworkIcon" :title="name" eyebrow="Bridge" />

      <UiPropertyList :data="details" :items="detailItems" class="properties" empty-value="-">
        <template #value-dhcpState>
          <UiChip
            v-if="dhcpState"
            :label="dhcpState"
            :tone="dhcpState.toLowerCase() === 'enabled' ? 'success' : 'neutral'"
            size="small"
            variant="tonal"
          />
          <span v-else>-</span>
        </template>

        <template #value-interfaces>
          <template v-if="interfaces.length > 0">
            <UiChip v-for="iface in interfaces" :key="iface" size="small" variant="outlined">{{ iface }}</UiChip>
          </template>
          <span v-else>-</span>
        </template>
      </UiPropertyList>
    </UiStack>
  </UiCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { NetworkIcon } from '@lucide/vue'

import UiStack from '@/lib/components/layout/UiStack.vue'
import UiPropertyList, { type Item as PropertyListItem } from '@/lib/components/list/UiPropertyList.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiChip from '@/lib/components/UiChip.vue'
import DashboardCardHeader from '@/components/dashboard/DashboardCardHeader.vue'

import type { NetworkBridgeCardProperties } from './types'

type BridgeDetails = Readonly<{
  mac: string
  ipv4?: string
  mask?: string
  dhcpState?: string
  leaseRange?: string
  interfaces: readonly string[]
}>

const { name, mac, ipv4, mask, dhcpState, leaseRange, interfaces } = defineProps<NetworkBridgeCardProperties>()

const details = computed<BridgeDetails>(() => ({
  mac,
  ipv4,
  mask,
  dhcpState,
  leaseRange,
  interfaces,
}))

const detailItems: readonly PropertyListItem<BridgeDetails>[] = [
  { field: 'mac', label: 'MAC address' },
  { field: 'ipv4', label: 'IPv4 address' },
  { field: 'mask', label: 'Mask' },
  { field: 'dhcpState', label: 'DHCP state' },
  { field: 'leaseRange', label: 'Lease range' },
  { field: 'interfaces', label: 'Interfaces' },
]
</script>

<style scoped>
@layer components {
  .network-bridge {
    & .properties {
      --property-list-field-size: min(9rem, 42%);
      --property-list-row-gap: 0;
      --property-list-row-padding: var(--space-sm) 0;
      --property-list-divider-style: solid;

      & :deep(.value) {
        justify-content: flex-end;
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        text-align: end;
      }
    }
  }
}
</style>
