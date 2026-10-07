<template>
  <component :is="icon" :stroke-width="strokeWidth" aria-hidden="true" class="icon" />
</template>

<script lang="ts" setup>
import { type Component } from 'vue'

const {
  size = '1.25rem',
  color = 'currentColor',
  strokeWidth = 2,
} = defineProps<{
  icon: Component
  size?: number | string
  color?: string
  strokeWidth?: number | string
}>()
</script>

<style scoped>
@layer components {
  .icon {
    color: v-bind(color);
    flex: 0 0 auto;
    width: v-bind(size);
    height: v-bind(size);
  }
}
</style>
