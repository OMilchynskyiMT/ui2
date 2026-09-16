<template>
  <UiFormGrid :columns="1">
    <UiCard>
      <UiFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
        <UiSwitch
          v-model="form.status"
          class="grid-full"
          hint="Configure this device as a DHCP server for the LAN"
          label="Enabled"
        />

        <UiSelect
          v-model="form.interface"
          :options="[
            { value: 'br0', title: 'Bridge' },
            { value: 'eth1', title: 'Ethernet' },
          ]"
          label="Interface"
        />

        <UiTextField v-model="form.subnet" label="Subnet" />
        <UiTextField v-model="form.gateway" hint="Usually the address of this device" label="Gateway" />
        <UiTextField v-model="form.mask" label="Mask" />

        <UiTextField v-model="form.domain" label="Domain" />

        <UiTextField
          v-model="form.leaseTime"
          hint="DHCP lease time set in days, hours, minutes. 00-00-00 is an infinite lease time"
          label="Lease Time"
        />
        <UiTextField
          v-model="form.leaseStart"
          hint="Start of range for dynamically assigned IP addresses"
          label="Lease Start"
        />
        <UiTextField
          v-model="form.leaseEnd"
          hint="End of range for dynamically assigned IP addresses"
          label="Lease End"
        />
      </UiFormGrid>
    </UiCard>

    <UiBottomActions adaptive>
      <UiButton>
        <template #leading><UiIcon :icon="CheckIcon" /></template>
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
  gateway: string
  subnet: string
  mask: string
  domain: string
  leaseTime: string
  leaseStart: string
  leaseEnd: string
}>({
  status: true,
  interface: 'br0',
  gateway: '192.168.2.1',
  subnet: '192.168.2.0',
  mask: '24',
  domain: 'example.com',
  leaseTime: '01-00-00',
  leaseStart: '',
  leaseEnd: '',
})
</script>
