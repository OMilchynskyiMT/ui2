<template>
  <div v-if="error" class="error">{{ error }}</div>
</template>

<script lang="ts" setup>
defineProps<{ error?: string | null }>()
</script>

<style scoped>
.error {
  color: var(--input-error-color);
  font-size: var(--input-error-font-size);
  line-height: 1.35;
}
</style>
