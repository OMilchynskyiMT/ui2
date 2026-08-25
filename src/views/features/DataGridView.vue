<template>
  <MFormGrid :columns="2">
    <MPropertyList :data :items empty-value="+">
      <template #value-test1="{ value }">
        <MCopyButton :text="String(value)" direction="rtl">{{ value }}</MCopyButton>
      </template>
      <template #value-someTestThree="{ value }">
        <MIcon :icon="UserIcon" color="red" />
        <MCopyButton :text="String(value)" style="--accent-color: var(--purple-500)">{{ value }}</MCopyButton>
      </template>
      <template #value-test4="{ value }">
        <MSignalStrength
          :level="Number(value) ?? 0"
          :steps="5"
          style="--color: var(--cyan-600)"
          title="Lorem ipsum"
        />
        {{ value }}
      </template>
    </MPropertyList>
  </MFormGrid>
</template>

<script lang="ts" setup>
import { UserIcon } from '@lucide/vue'

import MFormGrid from '@/components/grid/MFormGrid.vue'
import MPropertyList from '@/components/list/MPropertyList.vue'
import MIcon from '@/components/MIcon.vue'
import MCopyButton from '@/components/misc/MCopyButton.vue'
import MSignalStrength from '@/components/misc/MSignalStrength.vue'

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
