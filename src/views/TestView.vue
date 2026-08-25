<template>
  <MTabs
    :items="tabs"
    :model-value="route.name?.toString() ?? ''"
    aria-label="Component examples"
    @update:model-value="goto($event, id => router.push({ name: id }))"
  >
    <template #panel>
      <main style="padding: 3rem">
        <RouterView v-slot="{ Component }">
          <PageTransition :name="transitionName" appear>
            <component :is="Component" :key="route.fullPath" />
          </PageTransition>
        </RouterView>
      </main>
    </template>
  </MTabs>
</template>

<script lang="ts" setup>
import { BusFrontIcon, FormInputIcon, GlobeIcon } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import MTabs, { type MTabItem } from '@/lib/components/tabs/MTabs.vue'
import PageTransition from '@/components/transitions/PageTransition.vue'
import { useTabNavigation } from '@/composables/useTabNavigation'

const tabs: MTabItem<string>[] = [
  { icon: FormInputIcon, title: 'Inputs', value: 'inputs' },
  { icon: BusFrontIcon, title: 'Buttons', value: 'buttons' },
  { icon: GlobeIcon, title: 'Spinner & Progress', value: 'spinners' },
  { icon: GlobeIcon, title: 'Tab four', value: 'disabled', disabled: true },
  { title: 'Lists', value: 'lists' },
  { title: 'Chips', value: 'chips' },
  { title: 'Dialogs', value: 'dialogs' },
  { title: 'Menu', value: 'menu' },
  { title: 'Grid', value: 'grid' },
  { title: 'Table', value: 'table' },
  { title: 'Property List', value: 'property-list' },
  { title: 'Alerts', value: 'alerts' },
  { title: 'Notifications', value: 'notifications' },
  { title: 'Navigation', value: 'navigation' },
]

const router = useRouter()
const route = useRoute()
const { transitionName, goto } = useTabNavigation(
  tabs.filter(tab => !tab.disabled).map(tab => tab.value),
  () => route.name?.toString()
)
</script>
