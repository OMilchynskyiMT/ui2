<template>
  <MFormGrid :columns="1">
    <MCard>
      <MFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
        <MSwitch
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

        <MTextField v-model="form.subnet" label="Subnet" />
        <MTextField v-model="form.gateway" hint="Usually the address of this device" label="Gateway" />
        <MTextField v-model="form.mask" label="Mask" />

        <MTextField v-model="form.domain" label="Domain" />

        <MTextField
          v-model="form.leaseTime"
          hint="DHCP lease time set in days, hours, minutes. 00-00-00 is an infinite lease time"
          label="Lease Time"
        />
        <MTextField
          v-model="form.leaseStart"
          hint="Start of range for dynamically assigned IP addresses"
          label="Lease Start"
        />
        <MTextField v-model="form.leaseEnd" hint="End of range for dynamically assigned IP addresses" label="Lease End" />
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

import MButton from '@/lib/components/buttons/MButton.vue'
import MSelect from '@/lib/components/fields/MSelect.vue'
import MSwitch from '@/lib/components/fields/MSwitch.vue'
import MTextField from '@/lib/components/fields/MTextField.vue'
import MFormGrid from '@/lib/components/grid/MFormGrid.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MCard from '@/lib/components/section/MCard.vue'

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
