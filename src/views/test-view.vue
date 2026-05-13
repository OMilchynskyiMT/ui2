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
    <form-input label="Host">
      <template #before>
        <app-icon :icon="GlobeIcon" style="color: var(--purple-500); cursor: pointer" />
      </template>
    </form-input>
    <form-input type="number">
      Port from default slot
      <template #before>
        <app-icon :icon="ChevronsLeftRightEllipsisIcon" style="color: var(--blue-500)" />
      </template>
    </form-input>
    <form-input label="Service Name" />
    <form-input label="Packet Size (bytes)" type="number" />

    <form-password disabled label="Disabled password" />
    <form-password label="another password field" />

    <form-checkbox label="Test checkbox" />
    <form-checkbox disabled label="another disabled checkbox" />

    <form-toggle label="Test toggle" />
    <form-toggle disabled label="another disabled toggle" />

    <form-radio label="Test radio" />
    <form-radio disabled label="another disabled radio" />

    <form-combo-input v-model="combo" :options="comboOptions" label="Combo input">
      <template #before><app-icon :icon="GlobeIcon" style="color: var(--blue-500)" /></template>
    </form-combo-input>

    <div>{{ combo }}</div>
  </div>

  <tab-bar>
    <tab-item
      v-for="tab in tabs"
      :key="tab.label"
      :active="activeTab === tab.label"
      :disabled="tab.disabled"
      @click="activeTab = tab.label"
    >
      <app-icon :icon="tab.icon" />
      {{ tab.label }}
    </tab-item>
  </tab-bar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ChevronsLeftRightEllipsisIcon, GlobeIcon } from '@lucide/vue'

import AppIcon from '@/components/app-icon.vue'
import FormCheckbox from '@/components/form/form-checkbox.vue'
import FormComboInput from '@/components/form/form-combo-input.vue'
import FormInput from '@/components/form/form-input.vue'
import FormPassword from '@/components/form/form-password.vue'
import FormRadio from '@/components/form/form-radio.vue'
import FormToggle from '@/components/form/form-toggle.vue'
import TabBar from '@/components/tabs/tab-bar.vue'
import TabItem from '@/components/tabs/tab-item.vue'

import { useNotify } from '@/features/notifications'

const tabs = [
  { icon: GlobeIcon, label: 'Tab 1' },
  { icon: ChevronsLeftRightEllipsisIcon, label: 'Tab #2' },
  { icon: GlobeIcon, label: 'Tab three (disabled)', disabled: true },
  { icon: GlobeIcon, label: 'Tab four' },
]
const activeTab = ref('Tab 1')

const comboOptions = [
  { value: '8080:8181', title: 'Local addresses' },
  { value: 'disabled value', title: 'Disabled option', disabled: true },
  { value: '22', title: 'SSH' },
  { value: '80', title: 'Lighttpd' },
  { value: '443', title: 'Secured Lighttpd' },
]

const combo = ref('22')

const { info } = useNotify()
info('Test notification message', { timeout: 5000 })
</script>