<template>
  <RouterView />

  <Teleport to="#notifications">
    <Notifications />
  </Teleport>
</template>

<script lang="ts" setup>
import Notifications from '@/components/notifications/NotificationStack.vue'
</script>
