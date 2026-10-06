<template>
  <UiStack gap="var(--space-xxl)">
    <UiCard>
      <UiGrid :columns="{ base: 1, medium: 2, extraLarge: 4 }" gap="var(--space-xxl)">
        <UiGridItem span="full">
          <UiSwitch v-model="form.status" hint="Configure this device as a DHCP server for the LAN" label="Enabled" />
        </UiGridItem>

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
