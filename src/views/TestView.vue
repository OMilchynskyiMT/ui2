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
  </div>
</template>

<script lang="ts" setup>
import { ChevronsLeftRightEllipsisIcon, GlobeIcon } from '@lucide/vue'

import AppIcon from '@/components/AppIcon.vue'
import FormCheckbox from '@/components/form/FormCheckbox.vue'
import FormInput from '@/components/form/FormInput.vue'
import FormPassword from '@/components/form/FormPassword.vue'
import FormToggle from '@/components/form/FormToggle.vue'
</script>
