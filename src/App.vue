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

const { isExpired } = useUserSession()
watch(isExpired, expired => {
  if (!expired) return

  void useRouter().replace({
    name: 'sign-in',
    query: {
      redirect: useRoute().fullPath,
    },
  })
})
</script>
