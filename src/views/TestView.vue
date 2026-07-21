<template>
  <TabBar>
    <TabItem
      v-for="tab in tabs"
      :key="tab.label"
      :active="$route.name === tab.route"
      :disabled="tab.disabled"
      @click="goto(tab.route?.toString() ?? '', id => $router.push({ name: id }))"
    >
      <MIcon v-if="tab.icon" :icon="tab.icon" />
      {{ tab.label }}
    </TabItem>
  </TabBar>

  <main style="padding: 3rem; overflow: clip">
    <RouterView v-slot="{ Component }">
      <PageTransition :name="transtionName" appear>
        <component :is="Component" :key="$route.fullPath" />
      </PageTransition>
    </RouterView>
  </main>
</template>

<script lang="ts" setup>
import { BusFrontIcon, FormInputIcon, GlobeIcon } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import MIcon from '@/components/MIcon.vue'
import TabBar from '@/components/tabs/TabBar.vue'
import TabItem from '@/components/tabs/TabItem.vue'
import { useTabNavigation } from '@/components/tabs/useTabNavigation'
import PageTransition from '@/components/transitons/PageTransition.vue'

import { useNotify } from '@/features/notifications'

const tabs = [
  { icon: FormInputIcon, label: 'Inputs', route: 'inputs' },
  { icon: BusFrontIcon, label: 'Buttons', route: 'buttons' },
  { icon: GlobeIcon, label: 'Spinner & Progress', route: 'spinners' },
  { icon: GlobeIcon, label: 'Tab four', disabled: true },
  { label: 'Lists', route: 'lists' },
  { label: 'Chips', route: 'chips' },
  { label: 'Dialogs', route: 'dialogs' },
  { label: 'Menu', route: 'menu' },
  { label: 'Grid', route: 'grid' },
]
const $router = useRouter()
const $route = useRoute()

const { transtionName, goto } = useTabNavigation(
  tabs.filter(t => t.route !== undefined).map(t => t.route),
  $route.name?.toString()
)

const { info } = useNotify()
info('Test notification message', { timeout: 5000 })
</script>
