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
      <template #before><GlobeIcon style="color: var(--purple-500); cursor: pointer;" /></template>
    </FormInput>
    <FormInput type="number">
      Port from default slot
      <template #before>
        <ChevronsLeftRightEllipsisIcon style="color: var(--blue-500);" />
      </template>
    </FormInput>
    <FormInput label="Service Name" />
    <FormInput label="Packet Size (bytes)" type="number" />
    <FormInput label="Interval (seconds)" type="number" />
    <FormInput label="Max Attempts" type="number" error="test error" />

    <FormCheckbox label="Test checkbox" />
    <FormCheckbox label="another checkbox label" />

    <FormToggle label="Test toggle" />
    <FormToggle label="another toggle label" />
  </div>
</template>

<script lang="ts" setup>
import FormInput from '@/components/form/FormInput.vue'
import FormCheckbox from '@/components/form/FormCheckbox.vue';
import { ChevronsLeftRightEllipsisIcon, GlobeIcon } from '@lucide/vue'
import FormToggle from '@/components/form/FormToggle.vue';
</script>