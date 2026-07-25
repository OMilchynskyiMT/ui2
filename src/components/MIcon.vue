<template>
  <component
    :is="icon"
    :stroke-width="strokeWidth"
    :style="{ '--size': size, '--color': color ?? 'currentColor' }"
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
    color: var(--color, currentColor);
    flex: 0 0 auto;
    display: inline-flex;
    width: var(--size);
    height: var(--size);
  }
}
</style>
