<template>
  <MFormGrid :columns="1">
    <MSectionHeader>
      SMTP Configuration
      <template #description>
        Configure SMTP server and mail log settings to allow your device to send email messages
      </template>
    </MSectionHeader>

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
import { NotebookTabsIcon } from '@lucide/vue'
import { CogIcon } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import MFormGrid from '@/components/grid/MFormGrid.vue'
import MSectionHeader from '@/components/section/MSectionHeader.vue'
import MTabs from '@/components/tabs/MTabs.vue'
import { useTabNavigation } from '@/components/tabs/useTabNavigation'
import PageTransition from '@/components/transitions/PageTransition.vue'

const tabs = [
  { title: 'Settings', value: 'smtp-settings', icon: CogIcon },
  { title: 'Mail Log', value: 'smtp-log', icon: NotebookTabsIcon },
]

const route = useRoute()
const router = useRouter()

const { transitionName, goto } = useTabNavigation(
  tabs.map(t => t.value),
  route.name
)
</script>
