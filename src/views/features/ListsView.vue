<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem">
    <MListbox :active-value="active" :items="items" :selected-value="selected" @select="selected = $event.value" />
    <MListbox :active-value="active" :items="items" :selected-value="selected" @select="selected = $event.value">
      <template #item="{ item }">
        <strong>{{ item.title }}</strong>
        <div>{{ item.value }}</div>
      </template>
    </MListbox>

    <h1 style="grid-column: 1 / span 2">Popups</h1>

    <div style="display: flex; gap: 5rem">
      <button id="p-top-start" @click="showPopup(getbyId('p-top-start'), 'top-start')">Top Start</button>
      <button id="p-top-end" @click="showPopup(getbyId('p-top-end'), 'top-end')">Top End</button>
      <button id="p-bottom-start" @click="showPopup(getbyId('p-bottom-start'), 'bottom-start')">Bottom Start</button>
      <button id="p-bottom-end" @click="showPopup(getbyId('p-bottom-end'), 'bottom-end')">Bottom End</button>
    </div>

    <MPopup
      :anchor="popupAnchor"
      :open="popupShow"
      :placement="popupPosition"
      style="box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2); border-radius: 1rem;"
      :offset="10"
      @close="popupShow = false"
    >
      <MListbox :active-value="active" :items="items" :selected-value="selected" @select="selected = $event.value" />
    </MPopup>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import MListbox, { type ListItem } from '@/components/list/MListbox.vue'
import MPopup, { type Placement } from '@/components/popup/MPopup.vue'

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
const popupPosition = ref<Placement>('bottom-start')

const getbyId = (id: string): HTMLElement | null => document.querySelector(`#${id}`)

const showPopup = (anchor: HTMLElement | null, position: Placement) => {
  popupAnchor.value = anchor
  popupPosition.value = position
  popupShow.value = true
}
</script>
