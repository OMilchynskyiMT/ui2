<template>
  <div class="property-list-view">
    <section>
      <UiSectionHeader description="Key/value data with per-field rendering overrides and reusable inline actions">
        Property list
      </UiSectionHeader>

      <UiPropertyList :data :items empty-value="+">
        <template #value-test1="{ value }">
          <UiCopyButton :text="String(value)" direction="rtl">{{ value }}</UiCopyButton>
        </template>
        <template #value-someTestThree="{ value }">
          <UiIcon :icon="UserIcon" color="red" />
          <UiCopyButton :text="String(value)" style="--accent-color: var(--purple-500)">{{ value }}</UiCopyButton>
        </template>
        <template #value-test4="{ value }">
          <SignalStrength :level="Number(value)" :steps="5" style="--color: var(--cyan-600)" title="Lorem ipsum" />
          {{ value }}
        </template>
      </UiPropertyList>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { UserIcon } from '@lucide/vue'

import UiCopyButton from '@/lib/components/buttons/UiCopyButton.vue'
import UiPropertyList from '@/lib/components/list/UiPropertyList.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiIcon from '@/lib/components/UiIcon.vue'
import SignalStrength from '@/components/SignalStrength.vue'

const data = {
  test1: 'value1',
  testTwo: 'value2',
  someTestThree: 'value3',
  test4: 3,
}

const items = [
  { field: 'test1', label: 'Test #1 field name' },
  { field: 'testTwo', label: 'Test #2 field name' },
  { field: 'someTestThree' },
  { field: 'test4', label: 'Test #4 field name' },
]
</script>

<style scoped>
.property-list-view > section {
  min-inline-size: 0;
  display: grid;
  gap: var(--space-xl);
  inline-size: min(100%, var(--container-lg));
}
</style>
