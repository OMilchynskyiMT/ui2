<template>
  <RouterView />

  <Teleport to="#notifications">
    <notifications-root />
  </Teleport>
</template>

<script lang="ts" setup>
import { NotificationsRoot } from '@/features/notifications'
</script>

<style scoped></style>
