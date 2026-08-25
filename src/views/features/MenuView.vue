<template>
  <div class="menu-demo">
    <MButton
      ref="menu-trigger"
      :aria-expanded="opened"
      aria-haspopup="menu"
      tone="neutral"
      variant="tonal"
      @click="opened = !opened"
    >
      Open menu
    </MButton>

    <MMenu
      v-model:open="opened"
      aria-label="Example actions"
      :anchor="menuTrigger?.$el ?? null"
      :items="menuItems"
      :offset="8"
      @select="selected = $event.value"
    />

    <div v-if="selected">Selected: {{ selected }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue'
import { LogOutIcon, PaletteIcon, SaveIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MMenu, { type MMenuItem } from '@/lib/components/menu/MMenu.vue'

const menuTrigger = useTemplateRef<InstanceType<typeof MButton>>('menu-trigger')
const opened = ref(false)
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
