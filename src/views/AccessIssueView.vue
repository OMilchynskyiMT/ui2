<template>
  <main class="access-issue">
    <UiCard variant="outlined">
      <UiStack gap="var(--space-xl)">
        <UiSectionHeader>{{ title }}</UiSectionHeader>
        <UiAlert tone="warning">{{ message }}</UiAlert>
        <RouterLink :to="{ name: 'dashboard' }">Return to dashboard</RouterLink>
      </UiStack>
    </UiCard>
  </main>
</template>

<script lang="ts" setup>
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiAlert from '@/lib/components/status/UiAlert.vue'

defineProps<{ title: string; message: string }>()
</script>

<style scoped>
.access-issue {
  inline-size: min(100%, 42rem);
  margin-inline: auto;
  padding: var(--space-xxl);
}
</style>
