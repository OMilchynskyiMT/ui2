<template>
  <UiStack gap="var(--space-xxl)">
    <UiCard>
      <UiGrid :columns="{ base: 1, medium: 2, extraLarge: 4 }" gap="var(--space-xxl)">
        <UiGridItem span="full">
          <UiSwitch
            v-model="form.status"
            hint="Check to configure this device as a DHCPv6/RA server for the LAN"
            label="Enabled"
          />
        </UiGridItem>

        <UiSelect
          v-model="form.interface"
          :options="[{ value: 'br0', title: 'Bridge' }]"
          hint="Select the DHCPv6/RA server network interface"
          label="Interface"
        />

        <UiSelect
          v-model="form.raMode"
          :options="[
            { value: 'STATELESS', title: 'Stateless DHCP' },
            { value: 'SLAAC', title: 'SLAAC' },
          ]"
          hint="Select the Router Advertisement server mode, SLAAC only or Stateless DHCP"
        />

        <UiTextField
          v-model="form.leaseTime"
          hint="Preferred IPv6 address lease time set in days, hours, minutes. 00-00-00 is an infinite lease time"
          label="Lease Time"
        />
      </UiGrid>
    </UiCard>

    <UiBottomActions adaptive>
      <UiButton :icon="CheckIcon">Save</UiButton>
    </UiBottomActions>
  </UiStack>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CheckIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiSelect from '@/lib/components/fields/UiSelect.vue'
import UiSwitch from '@/lib/components/fields/UiSwitch.vue'
import UiTextField from '@/lib/components/fields/UiTextField.vue'
import UiGrid from '@/lib/components/grid/UiGrid.vue'
import UiGridItem from '@/lib/components/grid/UiGridItem.vue'
import UiBottomActions from '@/lib/components/layout/UiBottomActions.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'

const form = ref<{
  status: boolean
  interface: string
  raMode: string
  leaseTime: string
}>({
  status: true,
  interface: 'br0',
  raMode: 'STATELESS',
  leaseTime: '01-00-00',
})
</script>
