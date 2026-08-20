<template>
  <RouterView />

  <Teleport to="#notifications">
    <MNotifications />
  </Teleport>
</template>

<script lang="ts" setup>
import MNotifications from './features/notifications/MNotifications.vue'
</script>
