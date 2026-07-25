<template>
  <MBar>
    <template v-if="icon || slots.leading" #leading>
      <MIcon v-if="icon" :icon="icon" />
      <slot name="leading" />
    </template>

    <template v-if="slots.actions" #trailing>
      <slot name="actions" />
    </template>

    <header>
      <h2 :title="hint"><slot /></h2>
      <div class="description"><slot name="description" /></div>
    </header>
  </MBar>
</template>

<script lang="ts" setup>
import { type Component, useSlots } from 'vue'

import MBar from '../bars/MBar.vue'
import MIcon from '../MIcon.vue'

const slots = useSlots()

const { icon, hint } = defineProps<{
  icon?: Component
  hint?: string
}>()
</script>

<style scoped>
@layer components {
  .bar {
    & header {
      white-space: initial;

      & > div.description {
        font-size: var(--font-size-sm);
        color: var(--gray-500);
      }
    }
  }
}
</style>
