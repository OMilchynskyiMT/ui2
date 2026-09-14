<template>
  <div class="lists-view">
    <section>
      <UiSectionHeader description="Default and custom item rendering with shared selection state">
        Listboxes
      </UiSectionHeader>

      <UiFormGrid>
        <UiListbox v-model="selected" :items="items" aria-label="Default listbox" />
        <UiListbox v-model="selected" :items="items" aria-label="Custom listbox">
          <template #item="{ item }">
            <strong>{{ item.title }}</strong>
            <div>{{ item.value }}</div>
          </template>
        </UiListbox>
      </UiFormGrid>
    </section>

    <section>
      <UiSectionHeader
        description="Anchored overlays using the same listbox content at each supported corner placement"
      >
        Popovers
      </UiSectionHeader>

      <UiCluster>
        <UiButton id="p-top-start" variant="tonal" @click="showPopup(getById('p-top-start'), 'top-start')">
          Top start
        </UiButton>
        <UiButton id="p-top-end" variant="tonal" @click="showPopup(getById('p-top-end'), 'top-end')">
          Top end
        </UiButton>
        <UiButton id="p-bottom-start" variant="tonal" @click="showPopup(getById('p-bottom-start'), 'bottom-start')">
          Bottom start
        </UiButton>
        <UiButton id="p-bottom-end" variant="tonal" @click="showPopup(getById('p-bottom-end'), 'bottom-end')">
          Bottom end
        </UiButton>
      </UiCluster>

      <UiPopover
        :anchor="popupAnchor"
        :offset="10"
        :open="popupShow"
        :placement="popupPosition"
        style="--popover-radius: var(--radius-lg); --popover-shadow: var(--shadow-md)"
        @dismiss="popupShow = false"
      >
        <UiListbox v-model="selected" :items="items" aria-label="Popover listbox" />
      </UiPopover>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import type { ListboxOption } from '@/lib/components/list/listbox.types'
import UiListbox from '@/lib/components/list/UiListbox.vue'
import UiPopover, { type OverlayPlacement } from '@/lib/components/overlay/UiPopover.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'

const selected = ref<string | null>(null)
const items = ref<ListboxOption<string>[]>([
  { value: 'test 1', title: 'Test 1' },
  { value: 'test 2', title: 'Different title' },
  { value: 'Lorem ipsum', title: 'Lorem ipsum', disabled: true },
  { value: 'test 4' },
])
const popupShow = ref(false)
const popupAnchor = ref<HTMLElement | null>(null)
const popupPosition = ref<OverlayPlacement>('bottom-start')

const getById = (id: string): HTMLElement | null => document.querySelector(`#${id}`)

const showPopup = (anchor: HTMLElement | null, position: OverlayPlacement): void => {
  popupAnchor.value = anchor
  popupPosition.value = position
  popupShow.value = true
}
</script>

<style scoped>
.lists-view {
  min-inline-size: 0;
  display: grid;
  gap: var(--space-xxl);

  & > section {
    min-inline-size: 0;
    display: grid;
    gap: var(--space-xl);
  }
}
</style>
