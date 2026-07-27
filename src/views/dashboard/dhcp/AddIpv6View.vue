<template>
  <MFormGrid :columns="1">
    <MCard>
      <MFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
        <MToggle
          v-model="form.status"
          class="grid-full"
          hint="Check to configure this device as a DHCPv6/RA server for the LAN"
          label="Enabled"
        />

        <MSelect
          v-model="form.interface"
          :options="[{ value: 'br0', title: 'Bridge' }]"
          hint="Select the DHCPv6/RA server network interface"
          label="Interface"
        />

        <MSelect
          v-model="form.raMode"
          :options="[
            { value: 'STATELESS', title: 'Stateless DHCP' },
            { value: 'SLAAC', title: 'SLAAC' },
          ]"
          hint="Select the Router Advertisement server mode, SLAAC only or Stateless DHCP"
        />

        <MField
          v-model="form.leaseTime"
          hint="Preferred IPv6 address lease time set in days, hours, minutes. 00-00-00 is an infinite lease time"
          label="Lease Time"
        />
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
  raMode: string
  leaseTime: string
}>({
  status: true,
  interface: 'br0',
  raMode: 'STATELESS',
  leaseTime: '01-00-00',
})
</script>
