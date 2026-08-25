<template>
  <div class="menu-demo">
    <MMenuButton
      :items="menuItems"
      :offset="8"
      menu-aria-label="Example actions"
      tone="neutral"
      variant="tonal"
      @select="selected = $event.value"
    >
      Open menu
    </MMenuButton>

    <div v-if="selected">Selected: {{ selected }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { LogOutIcon, PaletteIcon, SaveIcon } from '@lucide/vue'

import type { MMenuItem } from '@/lib/components/menu/MMenu.vue'
import MMenuButton from '@/lib/components/menu/MMenuButton.vue'

const selected = ref<string>()
const menuItems: MMenuItem<string>[] = [
  { title: 'Save changes', icon: SaveIcon, value: 'save' },
  { title: 'Switch color scheme', icon: PaletteIcon, value: 'switch-color-scheme' },
  { title: 'Logout', icon: LogOutIcon, value: 'logout' },
]
</script>

<style scoped>
.menu-demo {
  display: grid;
  justify-items: start;
  gap: var(--space-md);
}
</style>
