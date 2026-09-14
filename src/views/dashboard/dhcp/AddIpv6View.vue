<template>
  <UiFormGrid :columns="1">
    <UiCard>
      <UiFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
        <UiSwitch
          v-model="form.status"
          class="grid-full"
          hint="Check to configure this device as a DHCPv6/RA server for the LAN"
          label="Enabled"
        />

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
      </UiFormGrid>
    </UiCard>

    <UiBottomActions adaptive>
      <UiButton>
        <UiIcon :icon="CheckIcon" />
        Save
      </UiButton>
    </UiBottomActions>
  </UiFormGrid>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CheckIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiSelect from '@/lib/components/fields/UiSelect.vue'
import UiSwitch from '@/lib/components/fields/UiSwitch.vue'
import UiTextField from '@/lib/components/fields/UiTextField.vue'
import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
import UiBottomActions from '@/lib/components/layout/UiBottomActions.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiIcon from '@/lib/components/UiIcon.vue'

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
