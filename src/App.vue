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
import { useUserSession } from '@/state/userSession'

const router = useRouter()
const route = useRoute()
const { isExpired } = useUserSession()

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
