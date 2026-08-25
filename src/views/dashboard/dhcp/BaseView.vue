<template>
  <MFormGrid :columns="1">
    <MSectionHeader>
      DHCP Servers and DHCPv6/RA Configuration
      <template #description>
        Configure DHCP server that supplies network configuration information to devices on the network
      </template>
    </MSectionHeader>

    <MTabs
      aria-label="DHCP sections"
      :items="tabs"
      :model-value="route.name?.toString() ?? ''"
      @update:model-value="goto($event, id => router.push({ name: id }))"
    >
      <template #panel>
        <RouterView v-slot="{ Component }">
          <PageTransition :name="transitionName" appear>
            <component :is="Component" :key="route.fullPath" />
          </PageTransition>
        </RouterView>
      </template>
    </MTabs>
  </MFormGrid>
</template>

<script lang="ts" setup>
import { CogIcon, PlusIcon } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import MFormGrid from '@/lib/components/grid/MFormGrid.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'
import MTabs, { type MTabItem } from '@/lib/components/tabs/MTabs.vue'
import PageTransition from '@/components/transitions/PageTransition.vue'
import { useTabNavigation } from '@/composables/useTabNavigation'

const tabs: MTabItem<string>[] = [
  { title: 'DHCP Configuration', icon: CogIcon, value: 'dhcp-config' },
  { title: 'Add IPv4 DHCP Server', icon: PlusIcon, value: 'dhcp-add' },
  { title: 'Add DHCPv6/RA', icon: PlusIcon, value: 'dhcp-add-v6' },
]

const router = useRouter()
const route = useRoute()
const { transitionName, goto } = useTabNavigation(
  tabs.map(tab => tab.value),
  () => route.name?.toString()
)
</script>
