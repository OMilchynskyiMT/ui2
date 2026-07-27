<template>
  <MFormGrid :columns="1">
    <MCaption>
      SMTP Configuration
      <template #description>
        Configure SMTP server and mail log settings to allow your device to send email messages
      </template>
    </MCaption>

    <MTabBar>
      <MTabItem
        v-for="tab in tabs"
        :key="tab.title"
        :active="route.name === tab.route"
        @click="goto(tab.route.toString(), id => router.push({ name: id }))"
      >
        <MIcon :icon="tab.icon" style="--color: var(--lime-500)" />
        {{ tab.title }}
      </MTabItem>
    </MTabBar>

    <RouterView v-slot="{ Component }">
      <PageTransition :name="transitionName" appear>
        <component :is="Component" :key="route.fullPath" />
      </PageTransition>
    </RouterView>
  </MFormGrid>
</template>

<script lang="ts" setup>
import { NotebookTabsIcon } from '@lucide/vue'
import { CogIcon } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import MFormGrid from '@/components/grid/MFormGrid.vue'
import MIcon from '@/components/MIcon.vue'
import MCaption from '@/components/section/MCaption.vue'
import MTabBar from '@/components/tabs/MTabBar.vue'
import MTabItem from '@/components/tabs/MTabItem.vue'
import { useTabNavigation } from '@/components/tabs/useTabNavigation'
import PageTransition from '@/components/transitons/PageTransition.vue'

const tabs = [
  { title: 'Settings', route: 'smtp-settings', icon: CogIcon },
  { title: 'Mail Log', route: 'smtp-log', icon: NotebookTabsIcon },
]

const route = useRoute()
const router = useRouter()

const { transitionName, goto } = useTabNavigation(
  tabs.map(t => t.route),
  route.name
)
</script>
