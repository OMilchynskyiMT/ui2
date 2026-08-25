<template>
  <div class="navigation-examples">
    <section>
      <h2>Menu button</h2>
      <MMenuButton
        :items="menuItems"
        :offset="8"
        menu-aria-label="Example actions"
        tone="neutral"
        variant="tonal"
        @select="selectedAction = $event.value"
      >
        Actions
      </MMenuButton>
      <div v-if="selectedAction" class="result">Selected: {{ selectedAction }}</div>
    </section>

    <section>
      <h2>Pagination</h2>
      <MPagination v-model="page" :page-count="18" />
      <div class="result">Current page: {{ page }}</div>
    </section>

    <section>
      <h2>Disclosure</h2>
      <div class="disclosures">
        <MDisclosure
          v-model="firstDisclosureOpen"
          description="Native details/summary semantics"
          title="Network options"
        >
          <template #leading>
            <MIcon :icon="TableConfigIcon" size="36px" style="--color: var(--accent)" />
          </template>
          <template #trailing>
            <MCluster>
              <MButton size="small" tone="neutral" variant="tonal">
                <MIcon :icon="RefreshCwIcon" size="1rem" />
                Refresh
              </MButton>
              <MButton size="small" tone="danger" variant="tonal">
                <MIcon :icon="TrashIcon" size="1rem" />
                Purge all
              </MButton>
            </MCluster>
          </template>
          <p>Advanced network configuration can be placed here without introducing an accordion abstraction.</p>
        </MDisclosure>

        <MDisclosure description="Independent disclosure state" title="Diagnostics" style="--accent: var(--tone-success);">
          <p>Each disclosure can be controlled independently through v-model when necessary.</p>
        </MDisclosure>
      </div>
    </section>

    <section>
      <h2>Breadcrumbs</h2>
      <MBreadcrumbs :items="breadcrumbs">
        <template #item="{ item, current }">
          <span v-if="current" aria-current="page">{{ item.label }}</span>
          <RouterLink v-else-if="item.target" :to="item.target">{{ item.label }}</RouterLink>
          <a v-else-if="item.href" :href="item.href">{{ item.label }}</a>
          <span v-else>{{ item.label }}</span>
        </template>
      </MBreadcrumbs>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { LogOutIcon, PaletteIcon, RefreshCwIcon, SaveIcon } from '@lucide/vue'
import { TrashIcon } from '@lucide/vue'
import { TableConfigIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MDisclosure from '@/lib/components/disclosure/MDisclosure.vue'
import MCluster from '@/lib/components/layout/MCluster.vue'
import type { MMenuItem } from '@/lib/components/menu/MMenu.vue'
import MMenuButton from '@/lib/components/menu/MMenuButton.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MBreadcrumbs from '@/lib/components/navigation/MBreadcrumbs.vue'
import MPagination from '@/lib/components/navigation/MPagination.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'

const page = ref(7)
const firstDisclosureOpen = ref(true)
const selectedAction = ref<string>()
const { breadcrumbs } = useBreadcrumbs()

const menuItems: MMenuItem<string>[] = [
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

    & > h2 {
      margin: 0;
    }
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
