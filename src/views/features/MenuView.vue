<template>
  <div class="menu-view">
    <section>
      <MSectionHeader description="Action menu with icons, typed values, and selection feedback">
        Menu button
      </MSectionHeader>

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

      <div v-if="selected" class="result">Selected: {{ selected }}</div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { LogOutIcon, PaletteIcon, SaveIcon } from '@lucide/vue'

import type { MMenuItem } from '@/lib/components/menu/MMenu.vue'
import MMenuButton from '@/lib/components/menu/MMenuButton.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'

const selected = ref<string>()
const menuItems: MMenuItem<string>[] = [
  { title: 'Save changes', icon: SaveIcon, value: 'save' },
  { title: 'Switch color scheme', icon: PaletteIcon, value: 'switch-color-scheme' },
  { title: 'Logout', icon: LogOutIcon, value: 'logout' },
]
</script>

<style scoped>
.menu-view > section {
  min-inline-size: 0;
  display: grid;
  justify-items: start;
  gap: var(--space-xl);
}

.result {
  color: var(--text-color-dimmed);
  font-size: var(--font-size-sm);
}
</style>
