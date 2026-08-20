<template>
  <div style="display: flex; gap: 1rem">
    <MButton @click.prevent="error('Error message')">Error</MButton>
    <MButton @click.prevent="warning('Warning message')">Warning</MButton>
    <MButton @click.prevent="success('Success message')">Success</MButton>
    <MButton @click.prevent="info('Info message')">Info</MButton>
    <MButton
      @click.prevent="
        notify('Notify message', {
          title: 'Custom notification',
          icon: ClockCheckIcon,
          kind: 'success',
        })
      "
    >
      Custom
    </MButton>
  </div>
</template>

<script lang="ts" setup>
import { ClockCheckIcon } from '@lucide/vue'

import MButton from '@/components/buttons/MButton.vue'

import { useNotifications } from '@/features/notifications'

const { error, warning, success, info, notify } = useNotifications()
</script>
