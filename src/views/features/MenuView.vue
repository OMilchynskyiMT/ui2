<template>
  <div class="menu-wrapper" style="width: 400px">
    <MMenu :options="options" style="--option-gap-y: var(--space-sm); --option-padding: var(--space-sm)"></MMenu>
  </div>
</template>

<script lang="ts" setup>
import { CogIcon, LayoutDashboardIcon, UserCog2Icon } from '@lucide/vue'
import { useRouter } from 'vue-router'

import MMenu, { type MenuOption } from '@/components/menu/MMenu.vue'

const router = useRouter()
const options: MenuOption[] = [
  { title: 'Dashboard', icon: LayoutDashboardIcon, to: router.resolve({ name: '' }) },
  {
    title: 'Setup',
    icon: CogIcon,
    items: [
      { title: 'WAN', to: router.resolve({ name: '' }) },
      { title: 'DHCP', to: router.resolve({ name: '' }) },
      { title: 'SMTP', to: router.resolve({ name: '' }) },
    ],
  },
  {
    title: 'Administration',
    icon: UserCog2Icon,
    items: [
      { title: 'Debug Options', to: router.resolve({ name: '' }), active: true },
      { title: 'Usage Policy', to: router.resolve({ name: '' }) },
    ],
  },
]
</script>
