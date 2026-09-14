<template>
  <UiAvatar :size="size" />
</template>

<script lang="ts" setup>
import UiAvatar from '@/lib/components/UiAvatar.vue'

const { size = '1.5rem' } = defineProps<{
  size?: string
}>()
</script>
