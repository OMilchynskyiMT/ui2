<template>
  <MTabs
    :check-active="tab => tab.value === route.name"
    :items="tabs"
    :on-select="tab => tab.value && goto(tab.value, id => router.push({ name: id }))"
  />

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

import MTabs from '@/components/tabs/MTabs.vue'
import { useTabNavigation } from '@/components/tabs/useTabNavigation'
import PageTransition from '@/components/transitons/PageTransition.vue'

import { useNotify } from '@/features/notifications'

const tabs = [
  { icon: FormInputIcon, title: 'Inputs', value: 'inputs' },
  { icon: BusFrontIcon, title: 'Buttons', value: 'buttons' },
  { icon: GlobeIcon, title: 'Spinner & Progress', value: 'spinners' },
  { icon: GlobeIcon, title: 'Tab four', disabled: true },
  { title: 'Lists', value: 'lists' },
  { title: 'Chips', value: 'chips' },
  { title: 'Dialogs', value: 'dialogs' },
  { title: 'Menu', value: 'menu' },
  { title: 'Grid', value: 'grid' },
  { title: 'Table', value: 'table' },
]
const router = useRouter()
const route = useRoute()

const { transitionName: transtionName, goto } = useTabNavigation(
  tabs.filter(t => t.value !== undefined).map(t => t.value),
  route.name?.toString()
)

const { info } = useNotify()
info('Test notification message', { timeout: 5000 })
</script>
