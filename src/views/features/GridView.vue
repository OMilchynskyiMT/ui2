<template>
  <div class="grid-view">
    <section>
      <MSectionHeader description="A basic responsive form grid that grows from one to two columns">
        Responsive columns
      </MSectionHeader>

      <MFormGrid :columns="{ small: 1, medium: 2 }">
        <MCard v-for="i of blocks" :key="i" :style="`--bg: hsl(${(i * blocks) / 0.5}, 70%, 65%)`" class="sample-card">
          lorem ipsum <br v-if="i % 3" />
          {{ i }}
        </MCard>
      </MFormGrid>
    </section>

    <section>
      <MSectionHeader description="Per-breakpoint column counts passed through the public columns property">
        Configured columns
      </MSectionHeader>

      <MFormGrid :columns="{ small: 1, medium: 2, large: 4, extraLarge: 5 }">
        <MSwitch v-for="i of blocks" :key="i" v-model="toggle" :label="`Toggle ${i}`" />
      </MFormGrid>
    </section>

    <section>
      <MSectionHeader description="The same responsive grid can be tuned through its CSS custom-property API">
        CSS variable overrides
      </MSectionHeader>

      <MFormGrid style="--columns-md: 2; --columns-lg: 3; --columns-xl: 4">
        <MNumber v-for="i of blocks" :key="i" v-model="numberModel" :label="`Number ${i}`" />
      </MFormGrid>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import MNumber from '@/lib/components/fields/MNumber.vue'
import MSwitch from '@/lib/components/fields/MSwitch.vue'
import MFormGrid from '@/lib/components/grid/MFormGrid.vue'
import MCard from '@/lib/components/section/MCard.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'

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
