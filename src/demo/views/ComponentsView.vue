<template>
  <div style="padding: 1rem">
    <UiButton @click="router.push({ name: 'demo-dashboard' })">to Dashboard</UiButton>
  </div>

  <UiTabs
    :items="tabs"
    :model-value="route.name?.toString() ?? ''"
    aria-label="Component examples"
    @update:model-value="router.push({ name: $event })"
  >
    <template #panel="{ index }">
      <main class="demo-content">
        <RouterView v-slot="{ Component }">
          <PageTransition :position="index" appear>
            <component :is="Component" :key="route.fullPath" />
          </PageTransition>
        </RouterView>
      </main>
    </template>
  </UiTabs>
</template>

<script lang="ts" setup>
import {
  BusFrontIcon,
  ChartBarIcon,
  CodeXmlIcon,
  FormInputIcon,
  GaugeIcon,
  GlobeIcon,
  LogInIcon,
  SmartphoneIcon,
} from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiTabs, { type UiTabItem } from '@/lib/components/tabs/UiTabs.vue'
import PageTransition from '@/components/transitions/PageTransition.vue'

const tabs: UiTabItem<string>[] = [
  { icon: FormInputIcon, title: 'Inputs', value: 'demo-inputs' },
  { icon: LogInIcon, title: 'Sign in', value: 'demo-sign-in' },
  { icon: BusFrontIcon, title: 'Buttons', value: 'demo-buttons' },
  { icon: GlobeIcon, title: 'Loading & Progress', value: 'demo-spinners' },
  { icon: GlobeIcon, title: 'Tab four', value: 'disabled', disabled: true },
  { title: 'Lists', value: 'demo-lists' },
  { title: 'Chips', value: 'demo-chips' },
  { title: 'Dialogs', value: 'demo-dialogs' },
  { title: 'Menu', value: 'demo-menu' },
  { title: 'Grid', value: 'demo-grid' },
  { title: 'Table', value: 'demo-table' },
  { title: 'Log viewer', value: 'demo-log-viewer' },
  { icon: CodeXmlIcon, title: 'Code editor', value: 'demo-code-editor' },
  { title: 'Radio terminal', value: 'demo-radio-terminal' },
  { title: 'Steps', value: 'demo-steps' },
  { title: 'GPS', value: 'demo-gps' },
  { title: 'Relative time', value: 'demo-relative-time' },
  { title: 'Certificates', value: 'demo-certificate' },
  { title: 'Property List', value: 'demo-property-list' },
  { title: 'Alerts', value: 'demo-alerts' },
  { title: 'Notifications', value: 'demo-notifications' },
  { title: 'Navigation', value: 'demo-navigation' },
  { icon: SmartphoneIcon, title: 'Mobile', value: 'demo-mobile' },
  { icon: ChartBarIcon, title: 'Charts', value: 'demo-bar-chart' },
  { icon: GaugeIcon, title: 'Dashboard', value: 'demo-dashboard-widgets' },
]

const router = useRouter()
const route = useRoute()
</script>

<style scoped>
.demo-back {
  display: inline-block;
  margin: var(--space-md) var(--space-xl) 0;
}

.demo-content {
  min-inline-size: 0;
  background: var(--surface-page);
  padding: var(--space-xl) max(var(--space-xl), var(--safe-area-right)) var(--space-xl)
    max(var(--space-xl), var(--safe-area-left));
}

@media (width < container-token(--container-sm)) {
  .demo-content {
    padding: var(--space-md) max(var(--space-md), var(--safe-area-right)) var(--space-md)
      max(var(--space-md), var(--safe-area-left));
  }
}
</style>
