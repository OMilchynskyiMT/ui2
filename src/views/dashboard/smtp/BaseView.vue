<template>
  <MFormGrid :columns="1">
    <MSectionHeader>
      SMTP Configuration
      <template #description>
        Configure SMTP server and mail log settings to allow your device to send email messages
      </template>
    </MSectionHeader>

    <MTabs
      aria-label="SMTP sections"
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
import { CogIcon, NotebookTabsIcon } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import MFormGrid from '@/lib/components/grid/MFormGrid.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'
import MTabs, { type MTabItem } from '@/lib/components/tabs/MTabs.vue'
import PageTransition from '@/components/transitions/PageTransition.vue'
import { useTabNavigation } from '@/composables/useTabNavigation'

const tabs: MTabItem<string>[] = [
  { title: 'Settings', value: 'smtp-settings', icon: CogIcon },
  { title: 'Mail Log', value: 'smtp-log', icon: NotebookTabsIcon },
]

const route = useRoute()
const router = useRouter()
const { transitionName, goto } = useTabNavigation(
  tabs.map(tab => tab.value),
  () => route.name?.toString()
)
</script>
