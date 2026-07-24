<template>
  <MAppShell>
    <template #footer>footer</template>
    <RouterView />
  </MAppShell>
</template>

<script lang="ts" setup>
import MAppShell from '@/components/MAppShell.vue'
</script>