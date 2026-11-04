<template>
  <Shell>
    <main class="content">
      <RouterView />
    </main>
  </Shell>
</template>

<script lang="ts" setup>
import Shell from '@/components/application/AppShell.vue'
</script>

<style scoped>
.content {
  min-inline-size: 0;
  padding: var(--space-xxl) max(var(--space-lg), var(--safe-area-right)) var(--space-xxl)
    max(var(--space-lg), var(--safe-area-left));
}
</style>
