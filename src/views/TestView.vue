<template>
  <div>TestView</div>
  <div
    style="
      display: grid;
      max-width: 50dvw;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding: 2rem;
      background-color: var(--surface-bg);
    "
  >
    <FormInput label="Host">
      <template #before>
        <AppIcon :icon="GlobeIcon" style="color: var(--purple-500); cursor: pointer" />
      </template>
    </FormInput>
    <FormInput type="number">
      Port from default slot
      <template #before>
        <AppIcon :icon="ChevronsLeftRightEllipsisIcon" style="color: var(--blue-500)" />
      </template>
    </FormInput>
    <FormInput label="Service Name" />
    <FormInput label="Packet Size (bytes)" type="number" />

    <FormPassword disabled label="Disabled password" />
    <FormPassword label="another password field" />

    <FormCheckbox label="Test checkbox" />
    <FormCheckbox disabled label="another disabled checkbox" />

    <FormToggle label="Test toggle" />
    <FormToggle disabled label="another disabled toggle" />

    <FormRadio label="Test radio" />
    <FormRadio disabled label="another disabled radio" />
  </div>

  <TabBar>
    <TabItem
      v-for="tab in tabs"
      :key="tab.label"
      :active="activeTab === tab.label"
      :disabled="tab.disabled"
      @click="activeTab = tab.label"
    >
      <AppIcon :icon="tab.icon" />
      {{ tab.label }}
    </TabItem>
  </TabBar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ChevronsLeftRightEllipsisIcon, GlobeIcon } from '@lucide/vue'

import AppIcon from '@/components/AppIcon.vue'
import FormCheckbox from '@/components/form/FormCheckbox.vue'
import FormInput from '@/components/form/FormInput.vue'
import FormPassword from '@/components/form/FormPassword.vue'
import FormRadio from '@/components/form/FormRadio.vue'
import FormToggle from '@/components/form/FormToggle.vue'
import TabBar from '@/components/tabs/TabBar.vue'
import TabItem from '@/components/tabs/TabItem.vue'

import { useNotify } from '@/features/notifications'

const tabs = [
  { icon: GlobeIcon, label: 'Tab 1' },
  { icon: ChevronsLeftRightEllipsisIcon, label: 'Tab #2' },
  { icon: GlobeIcon, label: 'Tab three (disabled)', disabled: true },
  { icon: GlobeIcon, label: 'Tab four' },
]
const activeTab = ref('Tab 1')

const { info } = useNotify()
info('Test notification message', { timeout: 5000 })
</script>
