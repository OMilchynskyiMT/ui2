<template>
  <MFormGrid :columns="2">
    <MDataGrid :data :items empty-value="+">
      <template #value-test1="{ value }">
        <MCopyToClipboard :text="String(value)" direction="rtl">{{ value }}</MCopyToClipboard>
      </template>
      <template #value-someTestThree="{ value }">
        <MIcon :icon="UserIcon" color="red" />
        <MCopyToClipboard :text="String(value)" style="--accent-color: var(--purple-500)">{{ value }}</MCopyToClipboard>
      </template>
    </MDataGrid>
  </MFormGrid>
</template>

<script lang="ts" setup>
import { UserIcon } from '@lucide/vue'

import MDataGrid from '@/components/grid/MDataGrid.vue'
import MFormGrid from '@/components/grid/MFormGrid.vue'
import MIcon from '@/components/MIcon.vue'
import MCopyToClipboard from '@/components/misc/MCopyToClipboard.vue'

const data = {
  test1: 'value1',
  testTwo: 'value2',
  someTestThree: 'value3',
  test4: 'value4',
}

const items = [
  { field: 'test1', label: 'Test #1 field name' },
  { field: 'testTwo', label: 'Test #2 field name' },
  { field: 'someTestThree' },
  { field: 'test4', label: 'Test #4 field name' },
]
</script>
