<template>
  <MAvatar :size="size" />
</template>

<script lang="ts" setup>
import MAvatar from '@/lib/components/MAvatar.vue'

const { size = '1.5rem' } = defineProps<{
  size?: string
}>()
</script>
