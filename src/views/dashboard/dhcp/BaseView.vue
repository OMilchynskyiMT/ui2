<template>
  <MFormGrid :columns="1">
    <MCaption>
      DHCP Servers and DHCPv6/RA Configuration
      <template #description>
        Configure DHCP server that supplies network configuration information to devices on the network
      </template>
    </MCaption>

    <MTabs
      :check-active="tab => route.name === tab.value"
      :items="tabs"
      :on-select="tab => tab.value && goto(tab.value, id => router.push({ name: id }))"
    />

    <RouterView v-slot="{ Component }">
      <PageTransition :name="transitionName" appear>
        <component :is="Component" :key="route.fullPath" />
      </PageTransition>
    </RouterView>
  </MFormGrid>
</template>

<script lang="ts" setup>
import { CogIcon, PlusIcon } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import MFormGrid from '@/components/grid/MFormGrid.vue'
import MCaption from '@/components/section/MCaption.vue'
import MTabs from '@/components/tabs/MTabs.vue'
import { useTabNavigation } from '@/components/tabs/useTabNavigation'
import PageTransition from '@/components/transitons/PageTransition.vue'

const tabs = [
  { title: 'DHCP Configuration', icon: CogIcon, value: 'dhcp-config' },
  { title: 'Add IPv4 DHCP Server', icon: PlusIcon, value: 'dhcp-add' },
  { title: 'Add DHCPv6/RA', icon: PlusIcon, value: 'dhcp-add-v6' },
]

const router = useRouter()
const route = useRoute()

const { transitionName, goto } = useTabNavigation(
  tabs.map(t => t.value),
  route.name
)
</script>
