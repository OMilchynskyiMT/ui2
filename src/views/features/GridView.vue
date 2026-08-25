<template>
  <div class="container">
    <MFormGrid :columns="2">
      <div v-for="i of blocks" :key="i" :style="`--bg: hsl(${(i * blocks) / 0.5}, 70%, 65%);`" class="card">
        lorem ipsum <br v-if="i % 3" />
        {{ i }}
      </div>
    </MFormGrid>

    <MFormGrid :columns="{ small: 2, medium: 3, large: 4, extraLarge: 5 }">
      <MSwitch v-for="i of blocks" :key="i" v-model="toggle" :label="`Toggle ${i}`" />
    </MFormGrid>

    <MFormGrid style="--columns-md: 2; --columns-lg: 3; --columns-xl: 4">
      <MNumber v-for="i of blocks" :key="i" v-model="numberModel" :label="`Number ${i}`" />
    </MFormGrid>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import MNumber from '@/lib/components/fields/MNumber.vue'
import MSwitch from '@/lib/components/fields/MSwitch.vue'
import MFormGrid from '@/lib/components/grid/MFormGrid.vue'

const blocks = 10
const toggle = ref(false)
const numberModel = ref(123)
</script>

<style scoped>
div.container {
  display: grid;
  gap: 2rem;
}

.grid > div.card {
  --shadow-color: oklch(0.5, 1, 0.33);
  background-color: var(--bg);
  color: contrast-color(var(--bg));
  padding: 1rem;
  box-shadow: var(--shadow-xs);
  border-radius: var(--radius-md);
}
</style>
