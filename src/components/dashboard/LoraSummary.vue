<template>
  <UiCard class="lora-summary" padding="medium">
    <UiPropertyList :data="details" :items="detailItems" class="properties" />
  </UiCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import UiPropertyList, { type Item as PropertyListItem } from '@/lib/components/list/UiPropertyList.vue'
import UiCard from '@/lib/components/section/UiCard.vue'

type LoraDetails = Readonly<{
  modelNumber: string
  hardware: string
  eui: string
  frequencyBand: string
}>

const { modelNumber, hardware, eui, frequencyBand } = defineProps<LoraDetails>()

const details = computed<LoraDetails>(() => ({
  modelNumber,
  hardware,
  eui,
  frequencyBand,
}))

const detailItems: readonly PropertyListItem<LoraDetails>[] = [
  { field: 'modelNumber', label: 'Model number' },
  { field: 'hardware', label: 'Hardware' },
  { field: 'eui', label: 'EUI' },
  { field: 'frequencyBand', label: 'Frequency band' },
]
</script>

<style scoped>
@layer components {
  .lora-summary {
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
