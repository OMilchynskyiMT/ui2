<template>
  <component
    :is="icon"
    :stroke-width="strokeWidth"
    aria-hidden="true"
    class="icon"
  />
</template>

<script lang="ts" setup>
import { type Component } from 'vue'

const { size = '1.25rem', strokeWidth = 2 } = defineProps<{
  icon: Component
  size?: number | string
  color?: string
  strokeWidth?: number | string
}>()
</script>

<style scoped>
@layer components {
  .icon {
    color: var(--color, v-bind(color));
    flex: 0 0 auto;
    width: var(--size, v-bind(size));
    height: var(--size, v-bind(size));
  }
}
</style>