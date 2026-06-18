<template>
  <component :is="icon" :size="size" :stroke-width="strokeWidth" aria-hidden="true" class="app-icon" />
</template>

<script lang="ts" setup>
import type { Component } from 'vue'

const { size = 24, strokeWidth = 2 } = defineProps<{
  icon: Component
  size?: number | string
  strokeWidth?: number | string
}>()
</script>

<style scoped>
.app-icon {
  flex: 0 0 auto;
  display: inline-block;
}
</style>
