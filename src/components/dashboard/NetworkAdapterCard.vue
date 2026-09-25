<template>
  <UiCard class="network-adapter" padding="medium" variant="filled">
    <UiStack gap="var(--space-lg)">
      <DashboardCardHeader :eyebrow="kindLabel" :icon="adapterIcon" :title="properties.name">
        <template #actions>
          <UiCluster class="status" justify="end">
            <UiChip v-if="properties.current" label="Current WAN" size="small" tone="primary" variant="tonal" />
            <UiChip :label="properties.state" :tone="stateTone(properties.state)" size="small" variant="tonal" />
          </UiCluster>
        </template>
      </DashboardCardHeader>

      <UiPropertyList
        v-if="details.items.length > 0"
        :data="details.data"
        :items="details.items"
        class="properties"
        empty-value="-"
      >
        <template #value-signal>
          <UiCluster v-if="signal" class="signal-value">
            <SignalStrength :level="signal.level" :steps="signal.steps ?? 5" :title="signal.title" />
            <strong>{{ signal.value }}</strong>
          </UiCluster>
          <span v-else>-</span>
        </template>

        <template #value="{ field, value }">
          <span :class="{ mono: details.monoFields.has(field) }">{{ displayValue(value) }}</span>
        </template>
      </UiPropertyList>
    </UiStack>
  </UiCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { EthernetPortIcon, RadioTowerIcon, WifiIcon } from '@lucide/vue'

import type { ComponentTone } from '@/lib/components/component.types'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiPropertyList, {
  type DataField as PropertyDataField,
  type Item as PropertyListItem,
} from '@/lib/components/list/UiPropertyList.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiChip from '@/lib/components/UiChip.vue'
import DashboardCardHeader from '@/components/dashboard/DashboardCardHeader.vue'
import SignalStrength from '@/components/SignalStrength.vue'

import type { NetworkAdapterCardProperties, NetworkAdapterSignal } from './types'

type AdapterDetailData = Readonly<{
  bridge?: string
  mac?: string
  mode?: string
  service?: string
  networkRegistration?: string
  signal?: NetworkAdapterSignal
  connected?: string
  apn?: string
  ipv4?: string
  dns?: string
  phoneNumber?: string
  tower?: string
}>

type DetailField = PropertyDataField<AdapterDetailData>

type DetailSet = Readonly<{
  data: AdapterDetailData
  items: readonly PropertyListItem<AdapterDetailData>[]
  monoFields: ReadonlySet<DetailField>
}>

const { adapter: properties } = defineProps<{ adapter: NetworkAdapterCardProperties }>()

const adapterIcon = computed(() => {
  switch (properties.kind) {
    case 'ethernet': {
      return EthernetPortIcon
    }
    case 'wifi': {
      return WifiIcon
    }
    case 'cellular': {
      return RadioTowerIcon
    }
  }
})

const signal = computed(() => (properties.kind === 'cellular' ? properties.signal : undefined))

const kindLabel = computed(() => {
  switch (properties.kind) {
    case 'ethernet': {
      return 'Ethernet'
    }
    case 'wifi': {
      return properties.role === 'lan' ? 'Wi-Fi Access Point' : 'Wi-Fi'
    }
    case 'cellular': {
      return 'Cellular'
    }
  }
})

const stateTone = (value: string): ComponentTone => {
  const normalized = value.toLowerCase()

  if (['connected', 'enabled'].includes(normalized)) return 'success'
  if (normalized.includes('no sim') || normalized.includes('searching')) return 'warning'
  return 'neutral'
}

const displayValue = (value: unknown): string => {
  return ([undefined, null, ''] as readonly unknown[]).includes(value) ? '-' : String(value)
}

const details = computed<DetailSet>(() => {
  switch (properties.kind) {
    case 'ethernet': {
      return {
        data: {
          bridge: properties.bridge,
          mac: properties.mac,
        },
        items: [
          { field: 'bridge', label: 'Bridge' },
          { field: 'mac', label: 'MAC address' },
        ],
        monoFields: new Set<DetailField>(['bridge', 'mac']),
      }
    }

    case 'wifi': {
      const isWan = properties.role === 'wan'

      return {
        data: {
          mode: properties.mode,
          mac: properties.mac,
        },
        items: isWan
          ? [
              { field: 'mode', label: 'Mode' },
              { field: 'mac', label: 'MAC address' },
            ]
          : [],
        monoFields: new Set<DetailField>(['mac']),
      }
    }

    case 'cellular': {
      return {
        data: {
          service: properties.service,
          networkRegistration: properties.networkRegistration,
          signal: properties.signal,
          connected: properties.connected,
          apn: properties.apn,
          ipv4: properties.ipv4,
          dns: properties.dns,
          phoneNumber: properties.phoneNumber,
          tower: properties.tower,
        },
        items: [
          { field: 'service', label: 'Cellular service' },
          { field: 'networkRegistration', label: 'Network registration' },
          { field: 'signal', label: 'Signal' },
          { field: 'connected', label: 'Connected' },
          { field: 'apn', label: 'APN' },
          { field: 'ipv4', label: 'IPv4 address' },
          { field: 'dns', label: 'DNS' },
          { field: 'phoneNumber', label: 'Phone number' },
          { field: 'tower', label: 'Tower' },
        ],
        monoFields: new Set<DetailField>(['connected', 'ipv4', 'dns', 'phoneNumber', 'tower']),
      }
    }
  }
})
</script>

<style scoped>
@layer components {
  .network-adapter {
    & .status {
      --cluster-gap: var(--space-xs);
    }

    & .properties {
      --field-size: min(9.5rem, 46%);
      --row-gap: 0;
      --row-padding: var(--space-sm) 0;
      --border-style: solid;

      & :deep(.value) {
        justify-content: flex-end;
        font-weight: var(--font-weight-semibold);
        text-align: end;

        & > .mono {
          font-family: var(--font-mono);
          font-size: var(--font-size-xs);
        }
      }
    }

    & .signal-value {
      --cluster-gap: var(--space-sm);

      flex-wrap: nowrap;

      & > :deep(.signal-strength) {
        --color: var(--tone-warning);
      }

      & > strong {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
    }
  }
}
</style>
