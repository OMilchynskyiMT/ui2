<template>
  <RouterView />

  <Teleport to="#notifications">
    <NotificationsRoot />
  </Teleport>
</template>

<script lang="ts" setup>
import { NotificationsRoot } from '@/features/notifications'
</script>

<style scoped></style>
