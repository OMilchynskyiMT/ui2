<template>
  <RouterView />

  <Teleport to="#notifications">
    <Notifications />
  </Teleport>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Notifications from '@/components/notifications/NotificationStack.vue'
import { useDeviceStatusPolling } from '@/models/device/deviceStatus'
import { useUserSession } from '@/state/userSession'

const router = useRouter()
const route = useRoute()
const { isExpired, current: currentUserSession } = useUserSession()
const statusPolling = useDeviceStatusPolling()

// only the application root owns the poller
// views subscribe to shared state
watch(
  currentUserSession,
  session => {
    if (session) statusPolling.start()
    else statusPolling.stop()
  },
  { immediate: true }
)

watch(isExpired, expired => {
  if (!expired) return

  void router.replace({
    name: 'sign-in',
    query: {
      redirect: route.fullPath,
    },
  })
})
</script>
