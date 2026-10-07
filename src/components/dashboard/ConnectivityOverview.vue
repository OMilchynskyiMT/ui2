<template>
  <UiCard class="connectivity-overview" padding="medium">
    <UiStack gap="var(--space-lg)">
      <DashboardCardHeader :icon="Globe2Icon" eyebrow="Connectivity" title="Internet">
        <template #actions>
          <UiChip
            :label="online ? 'Connected' : 'Disconnected'"
            :tone="online ? 'success' : 'danger'"
            size="small"
            variant="tonal"
          />
        </template>
      </DashboardCardHeader>

      <UiPropertyList :data="details" :items="detailItems" class="properties" empty-value="-" />
    </UiStack>
  </UiCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Globe2Icon } from '@lucide/vue'

import UiStack from '@/lib/components/layout/UiStack.vue'
import UiPropertyList, { type Item as PropertyListItem } from '@/lib/components/list/UiPropertyList.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiChip from '@/lib/components/UiChip.vue'
import DashboardCardHeader from '@/components/dashboard/DashboardCardHeader.vue'

type ConnectivityDetails = Readonly<{
  wanTransport?: string
  currentDns?: string
}>

const { online, wanTransport, currentDns } = defineProps<{
  online: boolean
  wanTransport?: string
  currentDns?: string
}>()

const details = computed<ConnectivityDetails>(() => ({
  wanTransport,
  currentDns,
}))

const detailItems: readonly PropertyListItem<ConnectivityDetails>[] = [
  { field: 'wanTransport', label: 'WAN transport' },
  { field: 'currentDns', label: 'Current DNS' },
]
</script>

<style scoped>
@layer components {
  .connectivity-overview {
    & .properties {
      --property-list-field-size: min(8rem, 42%);
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
