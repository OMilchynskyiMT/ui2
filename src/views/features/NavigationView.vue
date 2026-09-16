<template>
  <div class="navigation-examples">
    <section>
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
    </section>

    <section>
      <UiSectionHeader description="Compact page navigation that adapts its visible range">Pagination</UiSectionHeader>

      <UiPagination v-model="page" :page-count="18" />
      <div class="result">Current page: {{ page }}</div>
    </section>

    <section>
      <UiSectionHeader description="Independent native disclosure state with leading and trailing content"
        >Disclosures</UiSectionHeader
      >

      <div class="disclosures">
        <UiDisclosure
          v-model="firstDisclosureOpen"
          description="Native details/summary semantics"
          title="Network options"
        >
          <template #leading>
            <UiIcon :icon="TableConfigIcon" size="36px" style="--color: var(--accent)" />
          </template>
          <template #trailing>
            <UiCluster>
              <UiButton size="small" tone="neutral" variant="tonal">
                <template #leading><UiIcon :icon="RefreshCwIcon" size="1rem" /></template>
                Refresh
              </UiButton>
              <UiButton size="small" tone="danger" variant="tonal">
                <template #leading><UiIcon :icon="TrashIcon" size="1rem" /></template>
                Purge all
              </UiButton>
            </UiCluster>
          </template>
          <p>Advanced network configuration can be placed here without introducing an accordion abstraction.</p>
        </UiDisclosure>

        <UiDisclosure
          description="Independent disclosure state"
          style="--accent: var(--tone-success)"
          title="Diagnostics"
        >
          <p>Each disclosure can be controlled independently through v-model when necessary.</p>
        </UiDisclosure>
      </div>
    </section>

    <section>
      <UiSectionHeader description="Route-aware hierarchy with custom item rendering">Breadcrumbs</UiSectionHeader>

      <UiBreadcrumbs :items="breadcrumbs">
        <template #item="{ item, current }">
          <span v-if="current" aria-current="page">{{ item.label }}</span>
          <RouterLink v-else-if="item.target" :to="item.target">{{ item.label }}</RouterLink>
          <a v-else-if="item.href" :href="item.href">{{ item.label }}</a>
          <span v-else>{{ item.label }}</span>
        </template>
      </UiBreadcrumbs>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { LogOutIcon, PaletteIcon, RefreshCwIcon, SaveIcon, TableConfigIcon, TrashIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiDisclosure from '@/lib/components/disclosure/UiDisclosure.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
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
.navigation-examples {
  display: grid;
  gap: var(--space-xxl);

  & > section {
    min-inline-size: 0;
    display: grid;
    justify-items: start;
    gap: var(--space-md);
  }
}

.disclosures {
  inline-size: min(100%, 48rem);
  display: grid;
  gap: var(--space-sm);
}

.result {
  color: var(--text-color-dimmed);
  font-size: var(--font-size-sm);
}
</style>
