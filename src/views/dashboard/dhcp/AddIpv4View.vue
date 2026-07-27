<template>
  <MFormGrid :columns="1">
    <MCard>
      <MFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
        <MToggle
          v-model="form.status"
          class="grid-full"
          hint="Configure this device as a DHCP server for the LAN"
          label="Enabled"
        />

        <MSelect
          v-model="form.interface"
          :options="[
            { value: 'br0', title: 'Bridge' },
            { value: 'eth1', title: 'Ethernet' },
          ]"
          label="Interface"
        />

        <MField v-model="form.subnet" label="Subnet" />
        <MField v-model="form.gateway" hint="Usually the address of this device" label="Gateway" />
        <MField v-model="form.mask" label="Mask" />

        <MField v-model="form.domain" label="Domain" />

        <MField
          v-model="form.leaseTime"
          hint="DHCP lease time set in days, hours, minutes. 00-00-00 is an infinite lease time"
          label="Lease Time"
        />
        <MField
          v-model="form.leaseStart"
          hint="Start of range for dynamically assigned IP addresses"
          label="Lease Start"
        />
        <MField v-model="form.leaseEnd" hint="End of range for dynamically assigned IP addresses" label="Lease End" />
      </MFormGrid>
    </MCard>

    <div class="actions">
      <MButton>
        <MIcon :icon="CheckIcon" />
        Save
      </MButton>
    </div>
  </MFormGrid>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CheckIcon } from '@lucide/vue'

import MButton from '@/components/buttons/MButton.vue'
import MField from '@/components/fields/MField.vue'
import MSelect from '@/components/fields/MSelect.vue'
import MToggle from '@/components/fields/MToggle.vue'
import MFormGrid from '@/components/grid/MFormGrid.vue'
import MIcon from '@/components/MIcon.vue'
import MCard from '@/components/section/MCard.vue'

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
