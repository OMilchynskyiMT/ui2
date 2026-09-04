<template>
  <RouterView />

  <Teleport to="#notifications">
    <MNotifications />
  </Teleport>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MNotifications from '@/features/notifications/MNotifications.vue'
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
