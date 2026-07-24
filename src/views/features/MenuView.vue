<template>
  <div class="menu-wrapper" style="width: 400px">
    <MTreeMenu :items="menuItems" />
  </div>
</template>

<script lang="ts" setup>
import { CogIcon, LayoutDashboardIcon, UserCog2Icon } from '@lucide/vue'
import { useRouter } from 'vue-router'

import MTreeMenu, { type MTreeMenuItem } from '@/components/menu/MTreeMenu.vue'

const router = useRouter()
const menuItems: MTreeMenuItem<unknown>[] = [
  { title: 'Dashboard', icon: LayoutDashboardIcon, value: router.resolve({ name: '' }) },
  {
    title: 'Setup',
    icon: CogIcon,
    value: undefined,
    children: [
      { title: 'WAN', value: router.resolve({ name: '' }) },
      { title: 'DHCP', value: router.resolve({ name: '' }) },
      { title: 'SMTP', value: router.resolve({ name: '' }) },
    ],
  },
  {
    title: 'Administration',
    icon: UserCog2Icon,
    value: undefined,
    children: [
      { title: 'Debug Options', value: router.resolve({ name: '' }) },
      { title: 'Usage Policy', value: router.resolve({ name: '' }) },
    ],
  },
]
</script>
