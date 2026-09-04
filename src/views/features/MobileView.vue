<template>
  <div class="mobile-examples">
    <section>
      <MSectionHeader description="Responsive action rows with mobile safe-area handling">
        Bottom actions
      </MSectionHeader>

      <MCard class="actions-demo">
        <p>
          Resize the viewport below the medium breakpoint. The action area becomes sticky and can expand its actions
          when
          <code>adaptive</code> is enabled.
        </p>

        <MBottomActions adaptive>
          <MButton tone="neutral" variant="tonal">Cancel</MButton>
          <MButton tone="primary">
            <MIcon :icon="CheckIcon" size="1rem" />
            Save changes
          </MButton>
        </MBottomActions>
      </MCard>
    </section>

    <section>
      <MSectionHeader description="Measured action overflow without viewport breakpoints">
        Adaptive actions
      </MSectionHeader>

      <MCard class="adaptive-actions-demo">
        <p>The highest-priority actions remain visible while actions that no longer fit move into the overflow menu.</p>
        <MAdaptiveActions :items="adaptiveActions" aria-label="Example adaptive actions" />
      </MCard>
    </section>

    <section>
      <MSectionHeader description="Modal mobile surface built on the common dialog infrastructure">
        Bottom sheet
      </MSectionHeader>

      <MButton tone="primary" variant="tonal" @click="bottomSheet?.show()">
        <MIcon :icon="PanelBottomOpenIcon" size="1rem" />
        Open bottom sheet
      </MButton>

      <MBottomSheet
        ref="bottomSheet"
        description="The sheet keeps its header and actions outside the scrolling content region."
        title="Connection settings"
      >
        <div class="sheet-form">
          <MTextField v-model="sheetForm.hostname" label="Hostname" />
          <MTextField v-model="sheetForm.username" label="Username" />
          <MPasswordField v-model="sheetForm.password" label="Password" />

          <p class="hint">
            Focus a field on a phone to see the Visual Viewport values update while the software keyboard is open.
          </p>
        </div>

        <template #actions="{ close }">
          <MButton tone="neutral" variant="tonal" @click="close">Cancel</MButton>
          <MButton tone="primary" @click="close">
            <MIcon :icon="CheckIcon" size="1rem" />
            Apply
          </MButton>
        </template>
      </MBottomSheet>
    </section>

    <section>
      <MSectionHeader description="Reusable vertical scrolling with edge fades and stable scrollbar layout">
        Scroll area
      </MSectionHeader>

      <MScrollArea class="scroll-demo" fade-edges>
        <div class="scroll-demo-content">
          <div v-for="item in scrollItems" :key="item">Scrollable item {{ item }}</div>
        </div>
      </MScrollArea>
    </section>

    <section>
      <MSectionHeader description="Reactive browser Visual Viewport measurements"> Visual viewport </MSectionHeader>
      <MPropertyList :data="viewportData" :items="viewportItems" />
    </section>
  </div>
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

import MButton from '@/lib/components/buttons/MButton.vue'
import MBottomSheet, { type MBottomSheetExposed } from '@/lib/components/dialog/MBottomSheet.vue'
import MPasswordField from '@/lib/components/fields/MPasswordField.vue'
import MTextField from '@/lib/components/fields/MTextField.vue'
import MAdaptiveActions, { type MAdaptiveAction } from '@/lib/components/layout/MAdaptiveActions.vue'
import MBottomActions from '@/lib/components/layout/MBottomActions.vue'
import MScrollArea from '@/lib/components/layout/MScrollArea.vue'
import MPropertyList, { type Item as PropertyListItem } from '@/lib/components/list/MPropertyList.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MCard from '@/lib/components/section/MCard.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'
import { useVisualViewport } from '@/composables/useVisualViewport'

const bottomSheet = useTemplateRef<MBottomSheetExposed>('bottomSheet')
const viewport = useVisualViewport()
const scrollItems = Array.from({ length: 18 }, (_, index) => index + 1)

const adaptiveActions: MAdaptiveAction<string>[] = [
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

const viewportItems: PropertyListItem[] = [
  { field: 'supported', label: 'VisualViewport API' },
  { field: 'size', label: 'Visible size' },
  { field: 'offset', label: 'Offset' },
  { field: 'scale', label: 'Scale' },
]

const viewportData = computed(() => ({
  supported: viewport.supported.value ? 'Supported' : 'Fallback',
  size: `${formatPixels(viewport.width.value)} × ${formatPixels(viewport.height.value)}`,
  offset: `${formatPixels(viewport.offsetLeft.value)}, ${formatPixels(viewport.offsetTop.value)}`,
  scale: viewport.scale.value.toFixed(2),
}))
</script>

<style scoped>
.mobile-examples {
  display: grid;
  gap: var(--space-xxl);

  & > section {
    min-inline-size: 0;
    display: grid;
    justify-items: start;
    gap: var(--space-md);
    inline-size: min(100%, 52rem);
  }
}

.actions-demo,
.adaptive-actions-demo {
  inline-size: 100%;
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-lg);

  & > p {
    color: var(--text-color-dimmed);
  }
}

.sheet-form {
  display: grid;
  gap: var(--space-lg);

  & > .hint {
    color: var(--text-color-dimmed);
    font-size: var(--font-size-sm);
  }
}

.scroll-demo {
  inline-size: 100%;
  max-block-size: 14rem;
  border: 1px solid var(--divider-color);
  border-radius: var(--radius-lg);
  background-color: var(--surface-bg);
  --scroll-area-fade-color: var(--surface-bg);
}

.scroll-demo-content {
  display: grid;

  & > div {
    padding: var(--space-sm) var(--space-md);
    border-block-end: 1px solid var(--divider-color);

    &:last-child {
      border-block-end: 0;
    }
  }
}
</style>
