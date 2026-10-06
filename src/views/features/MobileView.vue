<template>
  <UiStack class="mobile-examples" gap="var(--space-xxl)">
    <UiStack align="start" gap="var(--space-md)" tag="section">
      <UiSectionHeader description="Responsive action rows with mobile safe-area handling">
        Bottom actions
      </UiSectionHeader>

      <UiCard class="actions-demo">
        <UiStack gap="var(--space-xl)">
          <p>
            Resize the viewport below the medium breakpoint. The action area becomes sticky and can expand its actions
            when
            <code>adaptive</code> is enabled.
          </p>

          <UiBottomActions adaptive>
            <UiButton tone="neutral" variant="tonal">Cancel</UiButton>
            <UiButton :icon="CheckIcon" tone="primary">Save changes</UiButton>
          </UiBottomActions>
        </UiStack>
      </UiCard>
    </UiStack>

    <UiStack align="start" gap="var(--space-md)" tag="section">
      <UiSectionHeader description="Measured action overflow without viewport breakpoints">
        Adaptive actions
      </UiSectionHeader>

      <UiCard class="adaptive-actions-demo">
        <UiStack gap="var(--space-xl)">
          <p>
            The highest-priority actions remain visible while actions that no longer fit move into the overflow menu.
          </p>
          <UiAdaptiveActions :items="adaptiveActions" aria-label="Example adaptive actions" />
        </UiStack>
      </UiCard>
    </UiStack>

    <UiStack align="start" gap="var(--space-md)" tag="section">
      <UiSectionHeader description="Modal mobile surface built on the common dialog infrastructure">
        Bottom sheet
      </UiSectionHeader>

      <UiButton :icon="PanelBottomOpenIcon" tone="primary" variant="tonal" @click="bottomSheet?.show()">
        Open bottom sheet
      </UiButton>

      <UiBottomSheet
        ref="bottomSheet"
        description="The sheet keeps its header and actions outside the scrolling content region."
        title="Connection settings"
      >
        <UiStack class="sheet-form" gap="var(--space-lg)">
          <UiTextField v-model="sheetForm.hostname" label="Hostname" />
          <UiTextField v-model="sheetForm.username" label="Username" />
          <UiPasswordField v-model="sheetForm.password" label="Password" />

          <p class="hint">
            Focus a field on a phone to see the Visual Viewport values update while the software keyboard is open.
          </p>
        </UiStack>

        <template #actions="{ close }">
          <UiBottomActions adaptive>
            <UiButton tone="neutral" variant="tonal" @click="close">Cancel</UiButton>
            <UiButton :icon="CheckIcon" tone="primary" @click="close">Apply</UiButton>
          </UiBottomActions>
        </template>
      </UiBottomSheet>
    </UiStack>

    <UiStack align="start" gap="var(--space-md)" tag="section">
      <UiSectionHeader description="Reusable vertical scrolling with edge fades and stable scrollbar layout">
        Scroll area
      </UiSectionHeader>

      <UiScrollArea class="scroll-demo" fade-edges>
        <div class="scroll-demo-content">
          <div v-for="item in scrollItems" :key="item">Scrollable item {{ item }}</div>
        </div>
      </UiScrollArea>
    </UiStack>

    <UiStack align="start" gap="var(--space-md)" tag="section">
      <UiSectionHeader description="Reactive browser Visual Viewport measurements"> Visual viewport </UiSectionHeader>
      <UiPropertyList :data="viewportData" :items="viewportItems" />
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import { computed, reactive, useTemplateRef } from 'vue'
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  PanelBottomOpenIcon,
  RefreshCwIcon,
  SettingsIcon,
  TrashIcon,
} from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiBottomSheet, { type UiBottomSheetExposed } from '@/lib/components/dialog/UiBottomSheet.vue'
import UiPasswordField from '@/lib/components/fields/UiPasswordField.vue'
import UiTextField from '@/lib/components/fields/UiTextField.vue'
import UiAdaptiveActions, { type UiAdaptiveAction } from '@/lib/components/layout/UiAdaptiveActions.vue'
import UiBottomActions from '@/lib/components/layout/UiBottomActions.vue'
import UiScrollArea from '@/lib/components/layout/UiScrollArea.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiPropertyList, { type Item as PropertyListItem } from '@/lib/components/list/UiPropertyList.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import { useVisualViewport } from '@/lib/composables/useVisualViewport'

const bottomSheet = useTemplateRef<UiBottomSheetExposed>('bottomSheet')
const viewport = useVisualViewport()
const scrollItems = Array.from({ length: 18 }, (_, index) => index + 1)

const adaptiveActions: UiAdaptiveAction<string>[] = [
  { label: 'Refresh', value: 'refresh', icon: RefreshCwIcon, priority: 2, tone: 'primary', variant: 'tonal' },
  { label: 'Settings', value: 'settings', icon: SettingsIcon, priority: 1, tone: 'neutral', variant: 'tonal' },
  { label: 'Duplicate', value: 'duplicate', icon: CopyIcon, tone: 'neutral', variant: 'tonal' },
  { label: 'Export', value: 'export', icon: DownloadIcon, tone: 'neutral', variant: 'tonal' },
  { label: 'Delete', value: 'delete', icon: TrashIcon, tone: 'danger', variant: 'tonal' },
]

const sheetForm = reactive({
  hostname: 'gateway.local',
  username: 'admin',
  password: '',
})

const formatPixels = (value: number): string => `${Math.round(value)}px`

type ViewportData = {
  supported: string
  size: string
  offset: string
  scale: string
}

const viewportItems = [
  { field: 'supported', label: 'VisualViewport API' },
  { field: 'size', label: 'Visible size' },
  { field: 'offset', label: 'Offset' },
  { field: 'scale', label: 'Scale' },
] satisfies readonly PropertyListItem<ViewportData>[]

const viewportData = computed<ViewportData>(() => ({
  supported: viewport.supported.value ? 'Supported' : 'Fallback',
  size: `${formatPixels(viewport.width.value)} × ${formatPixels(viewport.height.value)}`,
  offset: `${formatPixels(viewport.offsetLeft.value)}, ${formatPixels(viewport.offsetTop.value)}`,
  scale: viewport.scale.value.toFixed(2),
}))
</script>

<style scoped>
.mobile-examples > section {
  inline-size: min(100%, 52rem);
}

.actions-demo,
.adaptive-actions-demo {
  inline-size: 100%;
  padding: var(--space-lg);
}

.actions-demo p,
.adaptive-actions-demo p,
.sheet-form > .hint {
  color: var(--text-color-dimmed);
}

.sheet-form > .hint {
  font-size: var(--font-size-sm);
}

.scroll-demo {
  inline-size: 100%;
  max-block-size: 14rem;
  border: 1px solid var(--divider-color);
  border-radius: var(--radius-lg);
  background-color: var(--surface-bg);
  --scroll-area-fade-color: var(--surface-bg);
}

.scroll-demo-content > div {
  padding: var(--space-sm) var(--space-md);
  border-block-end: 1px solid var(--divider-color);

  &:last-child {
    border-block-end: 0;
  }
}
</style>
