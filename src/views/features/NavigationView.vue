<template>
  <UiStack gap="var(--space-xxl)">
    <UiStack align="start" gap="var(--space-md)" tag="section">
      <UiSectionHeader description="Typed actions exposed through an anchored menu surface"
        >Menu button</UiSectionHeader
      >

      <UiMenuButton
        :items="menuItems"
        :offset="8"
        menu-aria-label="Example actions"
        tone="neutral"
        variant="tonal"
        @select="selectedAction = $event.value"
      >
        Actions
      </UiMenuButton>
      <div v-if="selectedAction" class="result">Selected: {{ selectedAction }}</div>
    </UiStack>

    <UiStack align="start" gap="var(--space-md)" tag="section">
      <UiSectionHeader description="Compact page navigation that adapts its visible range">Pagination</UiSectionHeader>

      <UiPagination v-model="page" :page-count="18" />
      <div class="result">Current page: {{ page }}</div>
    </UiStack>

    <UiStack align="start" gap="var(--space-md)" tag="section">
      <UiSectionHeader description="Independent native disclosure state with leading and trailing content"
        >Disclosures</UiSectionHeader
      >

      <UiStack class="disclosures" gap="var(--space-sm)">
        <UiDisclosure
          v-model="firstDisclosureOpen"
          description="Native details/summary semantics"
          title="Network options"
        >
          <template #leading>
            <UiIcon :icon="TableConfigIcon" color="var(--accent)" size="36px" />
          </template>
          <template #trailing>
            <UiCluster>
              <UiButton :icon="RefreshCwIcon" size="small" tone="neutral" variant="tonal">Refresh</UiButton>
              <UiButton :icon="TrashIcon" size="small" tone="danger" variant="tonal">Purge all</UiButton>
            </UiCluster>
          </template>
          <p>Advanced network configuration can be placed here without introducing an accordion abstraction.</p>
        </UiDisclosure>

        <UiDisclosure
          description="Independent disclosure state"
          style="--disclosure-accent-color: var(--tone-success)"
          title="Diagnostics"
        >
          <p>Each disclosure can be controlled independently through v-model when necessary.</p>
        </UiDisclosure>
      </UiStack>
    </UiStack>

    <UiStack align="start" gap="var(--space-md)" tag="section">
      <UiSectionHeader description="Route-aware hierarchy with custom item rendering">Breadcrumbs</UiSectionHeader>

      <UiBreadcrumbs :items="breadcrumbs">
        <template #item="{ item, current }">
          <span v-if="current" aria-current="page">{{ item.label }}</span>
          <RouterLink v-else-if="item.target" :to="item.target">{{ item.label }}</RouterLink>
          <a v-else-if="item.href" :href="item.href">{{ item.label }}</a>
          <span v-else>{{ item.label }}</span>
        </template>
      </UiBreadcrumbs>
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { LogOutIcon, PaletteIcon, RefreshCwIcon, SaveIcon, TableConfigIcon, TrashIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiDisclosure from '@/lib/components/disclosure/UiDisclosure.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import type { UiMenuItem } from '@/lib/components/menu/UiMenu.vue'
import UiMenuButton from '@/lib/components/menu/UiMenuButton.vue'
import UiBreadcrumbs from '@/lib/components/navigation/UiBreadcrumbs.vue'
import UiPagination from '@/lib/components/navigation/UiPagination.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiIcon from '@/lib/components/UiIcon.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'

const page = ref(7)
const firstDisclosureOpen = ref(true)
const selectedAction = ref<string>()
const { breadcrumbs } = useBreadcrumbs()

const menuItems: UiMenuItem<string>[] = [
  { title: 'Save changes', icon: SaveIcon, value: 'save' },
  { title: 'Switch color scheme', icon: PaletteIcon, value: 'switch-color-scheme' },
  { title: 'Logout', icon: LogOutIcon, value: 'logout' },
]
</script>

<style scoped>
.disclosures {
  inline-size: min(100%, 48rem);
}

.result {
  color: var(--text-color-dimmed);
  font-size: var(--font-size-sm);
}
</style>
