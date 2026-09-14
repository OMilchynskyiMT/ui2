<template>
  <UiFormGrid :columns="1">
    <UiSectionHeader>
      DHCP Servers and DHCPv6/RA Configuration
      <template #description>
        Configure DHCP server that supplies network configuration information to devices on the network
      </template>
    </UiSectionHeader>

    <UiTabs
      :items="tabs"
      :model-value="route.name?.toString() ?? ''"
      aria-label="DHCP sections"
      @update:model-value="goto($event, id => router.push({ name: id }))"
    >
      <template #panel>
        <RouterView v-slot="{ Component }">
          <PageTransition :name="transitionName" appear>
            <component :is="Component" :key="route.fullPath" />
          </PageTransition>
        </RouterView>
      </template>
    </UiTabs>
  </UiFormGrid>
</template>

<script lang="ts" setup>
import { CogIcon, PlusIcon } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiTabs, { type UiTabItem } from '@/lib/components/tabs/UiTabs.vue'
import PageTransition from '@/components/transitions/PageTransition.vue'
import { useTabNavigation } from '@/composables/useTabNavigation'

const tabs: UiTabItem<string>[] = [
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
