<template>
  <MFormGrid :columns="1">
    <MCard>
      <MFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
        <MSwitch
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

        <MTextField
          v-model="form.leaseTime"
          hint="Preferred IPv6 address lease time set in days, hours, minutes. 00-00-00 is an infinite lease time"
          label="Lease Time"
        />
      </MFormGrid>
    </MCard>

    <MBottomActions adaptive>
      <MButton>
        <MIcon :icon="CheckIcon" />
        Save
      </MButton>
    </MBottomActions>
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
import MBottomActions from '@/lib/components/layout/MBottomActions.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MCard from '@/lib/components/section/MCard.vue'

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
