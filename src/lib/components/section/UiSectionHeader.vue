<template>
  <UiBar>
    <template v-if="icon || slots.leading" #leading>
      <UiIcon v-if="icon" :icon="icon" />
      <slot name="leading" />
    </template>

    <template v-if="slots.actions" #trailing>
      <slot name="actions" />
    </template>

    <header>
      <h2 :title="hint"><slot /></h2>
      <div v-if="description || slots.description" class="description">
        <slot name="description">{{ description }}</slot>
      </div>
    </header>
  </UiBar>
</template>

<script lang="ts" setup>
import { type Component, useSlots } from 'vue'

import UiBar from '../bars/UiBar.vue'
import UiIcon from '../UiIcon.vue'

const slots = useSlots()

const { icon, hint, description } = defineProps<{
  icon?: Component
  hint?: string
  description?: string
}>()
</script>

<style scoped>
@layer components {
  .bar {
    & header {
      white-space: initial;

      & > div.description {
        font-size: var(--font-size-sm);
        color: var(--text-color-dimmed);
      }
    }
  }
}
</style>
