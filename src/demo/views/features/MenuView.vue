<template>
  <UiStack gap="var(--space-xl)">
    <UiStack align="start" gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Action menu with icons, typed values, and selection feedback">
        Menu button
      </UiSectionHeader>

      <UiMenuButton
        :items="menuItems"
        :offset="8"
        menu-aria-label="Example actions"
        tone="neutral"
        variant="tonal"
        @select="selected = $event.value"
      >
        Open menu
      </UiMenuButton>

      <div v-if="selected" class="result">Selected: {{ selected }}</div>
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { LogOutIcon, PaletteIcon, SaveIcon } from '@lucide/vue'

import UiStack from '@/lib/components/layout/UiStack.vue'
import type { UiMenuItem } from '@/lib/components/menu/UiMenu.vue'
import UiMenuButton from '@/lib/components/menu/UiMenuButton.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'

const selected = ref<string>()
const menuItems: UiMenuItem<string>[] = [
  { title: 'Save changes', icon: SaveIcon, value: 'save' },
  { title: 'Switch color scheme', icon: PaletteIcon, value: 'switch-color-scheme' },
  { title: 'Logout', icon: LogOutIcon, value: 'logout' },
]
</script>

<style scoped>
.result {
  color: var(--text-color-dimmed);
  font-size: var(--font-size-sm);
}
</style>
