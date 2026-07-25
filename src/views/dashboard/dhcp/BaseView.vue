<template>
  <div class="dhcp">
    <MCaption>
      DHCP Servers and DHCPv6/RA Configuration
      <template #description>
        Configure DHCP server that supplies network configuration information to devices on the network
      </template>
    </MCaption>

    <MTabBar>
      <MTabItem
        v-for="tab in tabs"
        :key="tab.title"
        :active="route.name === tab.route"
        @click="goto(tab.route?.toString(), id => router.push({ name: id }))"
      >
        <MIcon :icon="tab.icon" style="--color: var(--lime-500);" />
        {{ tab.title }}
      </MTabItem>
    </MTabBar>

    <RouterView v-slot="{ Component }">
      <PageTransition :name="transitionName" appear>
        <component :is="Component" :key="route.fullPath" />
      </PageTransition>
    </RouterView>
  </div>
</template>

<script lang="ts" setup>
import { CogIcon, PlusIcon } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import MIcon from '@/components/MIcon.vue'
import MCaption from '@/components/section/MCaption.vue'
import MTabBar from '@/components/tabs/MTabBar.vue'
import MTabItem from '@/components/tabs/MTabItem.vue'
import { useTabNavigation } from '@/components/tabs/useTabNavigation'
import PageTransition from '@/components/transitons/PageTransition.vue'

const tabs = [
  { title: 'DHCP Configuration', icon: CogIcon, route: 'dhcp-config' },
  { title: 'Add IPv4 DHCP Server', icon: PlusIcon, route: 'dhcp-add' },
  { title: 'Add DHCPv6/RA', icon: PlusIcon, route: 'dhcp-add-v6' },
]

const router = useRouter()
const route = useRoute()

const { transitionName, goto } = useTabNavigation(
  tabs.map(t => t.route),
  route.name
)
</script>

<style scoped>
div.dhcp {
  display: grid;
  gap: var(--space-xl);
}
</style>