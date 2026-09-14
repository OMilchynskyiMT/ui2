<template>
  <div class="grid-view">
    <section>
      <UiSectionHeader description="A basic responsive form grid that grows from one to two columns">
        Responsive columns
      </UiSectionHeader>

      <UiFormGrid :columns="{ small: 1, medium: 2 }">
        <UiCard v-for="i of blocks" :key="i" :style="`--bg: hsl(${(i * blocks) / 0.5}, 70%, 65%)`" class="sample-card">
          lorem ipsum <br v-if="i % 3" />
          {{ i }}
        </UiCard>
      </UiFormGrid>
    </section>

    <section>
      <UiSectionHeader description="Per-breakpoint column counts passed through the public columns property">
        Configured columns
      </UiSectionHeader>

      <UiFormGrid :columns="{ small: 1, medium: 2, large: 4, extraLarge: 5 }">
        <UiSwitch v-for="i of blocks" :key="i" v-model="toggle" :label="`Toggle ${i}`" />
      </UiFormGrid>
    </section>

    <section>
      <UiSectionHeader description="The same responsive grid can be tuned through its CSS custom-property API">
        CSS variable overrides
      </UiSectionHeader>

      <UiFormGrid style="--columns-md: 2; --columns-lg: 3; --columns-xl: 4">
        <UiNumberField v-for="i of blocks" :key="i" v-model="numberModel" :label="`Number ${i}`" />
      </UiFormGrid>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import UiNumberField from '@/lib/components/fields/UiNumberField.vue'
import UiSwitch from '@/lib/components/fields/UiSwitch.vue'
import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'

const blocks = 10
const toggle = ref(false)
const numberModel = ref(123)
</script>

<style scoped>
.grid-view {
  min-inline-size: 0;
  display: grid;
  gap: var(--space-xxl);

  & > section {
    min-inline-size: 0;
    display: grid;
    gap: var(--space-xl);
  }
}

.sample-card {
  --padding-block: var(--space-lg);
  --padding-inline: var(--space-lg);
  color: contrast-color(var(--bg));
}
</style>
