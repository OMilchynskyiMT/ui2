<template>
  <div class="lists-view">
    <section>
      <MSectionHeader description="Default and custom item rendering with shared selection state">
        Listboxes
      </MSectionHeader>

      <MFormGrid>
        <MListbox :active-value="active" :items="items" :selected-value="selected" @select="selected = $event.value" />
        <MListbox :active-value="active" :items="items" :selected-value="selected" @select="selected = $event.value">
          <template #item="{ item }">
            <strong>{{ item.title }}</strong>
            <div>{{ item.value }}</div>
          </template>
        </MListbox>
      </MFormGrid>
    </section>

    <section>
      <MSectionHeader description="Anchored overlays using the same listbox content at each supported corner placement">
        Popovers
      </MSectionHeader>

      <MCluster>
        <MButton id="p-top-start" variant="tonal" @click="showPopup(getById('p-top-start'), 'top-start')">
          Top start
        </MButton>
        <MButton id="p-top-end" variant="tonal" @click="showPopup(getById('p-top-end'), 'top-end')"> Top end </MButton>
        <MButton id="p-bottom-start" variant="tonal" @click="showPopup(getById('p-bottom-start'), 'bottom-start')">
          Bottom start
        </MButton>
        <MButton id="p-bottom-end" variant="tonal" @click="showPopup(getById('p-bottom-end'), 'bottom-end')">
          Bottom end
        </MButton>
      </MCluster>

      <MPopover
        :anchor="popupAnchor"
        :offset="10"
        :open="popupShow"
        :placement="popupPosition"
        style="--popover-radius: var(--radius-lg); --popover-shadow: var(--shadow-md)"
        @dismiss="popupShow = false"
      >
        <MListbox :active-value="active" :items="items" :selected-value="selected" @select="selected = $event.value" />
      </MPopover>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MFormGrid from '@/lib/components/grid/MFormGrid.vue'
import MCluster from '@/lib/components/layout/MCluster.vue'
import type { ListItem } from '@/lib/components/list/listbox.types'
import MListbox from '@/lib/components/list/MListbox.vue'
import MPopover, { type OverlayPlacement } from '@/lib/components/overlay/MPopover.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'

const selected = ref()
const active = ref()
const items = ref<ListItem<string>[]>([
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
