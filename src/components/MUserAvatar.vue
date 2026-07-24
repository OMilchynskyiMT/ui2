<template>
  <div class="avatar" :style="`--size: ${size};`">
    <MIcon :icon="User2Icon" :size />
  </div>
</template>

<script lang="ts" setup>
import { User2Icon } from '@lucide/vue'

import MIcon from './MIcon.vue'

const { size = '1.5rem' } = defineProps<{
  size?: string
}>()
</script>

<style scoped>
.avatar {
  --accent: var(--blue-500);
  --padding: calc(var(--size) / 4);
  --bg: oklch(from var(--accent) l c h / 0.2);

  display: flex;
  place-items: center;
  place-content: center;
  border-radius: 50%;
  background-color: var(--bg);
  color: var(--color-gray-600);
  padding: var(--padding);

  & > svg {
    color: var(--accent);
  }
}
</style>
