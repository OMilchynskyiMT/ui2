<template>
  <component :is="icon" ref="icon" :size="size" :stroke-width="strokeWidth" aria-hidden="true" class="icon" />
</template>

<script lang="ts">
export type Exposed = {
  setColor: (color: string) => void
}
</script>

<script lang="ts" setup>
import { type Component, useTemplateRef } from 'vue'

const { size = 24, strokeWidth = 2 } = defineProps<{
  icon: Component
  size?: number | string
  strokeWidth?: number | string
}>()
const iconReference = useTemplateRef<SVGElement>('icon')

defineExpose<Exposed>({
  setColor: (color: string) => {
    iconReference.value?.style.setProperty('--color', color)
  },
})
</script>

<style scoped>
.icon {
  color: var(--color, currentColor);
  flex: 0 0 auto;
  display: inline-block;
}
</style>
