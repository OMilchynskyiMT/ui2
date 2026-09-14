<template>
  <UiFormGrid :columns="1">
    <UiSectionHeader>
      SMTP Configuration
      <template #description>
        Configure SMTP server and mail log settings to allow your device to send email messages
      </template>
    </UiSectionHeader>

    <UiTabs
      :items="tabs"
      :model-value="route.name?.toString() ?? ''"
      aria-label="SMTP sections"
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
import { CogIcon, NotebookTabsIcon } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiTabs, { type UiTabItem } from '@/lib/components/tabs/UiTabs.vue'
import PageTransition from '@/components/transitions/PageTransition.vue'
import { useTabNavigation } from '@/composables/useTabNavigation'

const tabs: UiTabItem<string>[] = [
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
