<template>
  <div style="display: flex; gap: 1rem; flex-wrap: wrap">
    <MButton @click.prevent="error('Error message')">Error</MButton>
    <MButton @click.prevent="warning('Warning message')">Warning</MButton>
    <MButton @click.prevent="success('Success message')">Success</MButton>
    <MButton @click.prevent="info('Info message')">Info</MButton>
    <MButton
      @click.prevent="
        notify('Notify message', {
          title: 'Custom notification',
          icon: ClockCheckIcon,
          tone: 'success',
        })
      "
    >
      Custom
    </MButton>

    <MButton tone="danger" @click.prevent="error('Notificaton with timeout', { timeout: 2000 })">
      Error with timeout
    </MButton>
    <MButton
      tone="warning"
      @click.prevent="
        warning(
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus placeat sint saepe magni quibusdam! Temporibus modi accusamus aliquam, in velit omnis doloremque sit consequuntur repudiandae aliquid sapiente, unde illo praesentium.',
          { timeout: 3000, title: 'And title' }
        )
      "
    >
      Warning with timeout
    </MButton>
    <MButton
      tone="success"
      @click.prevent="success('Notificaton with timeout', { timeout: 4000, icon: ClockCheckIcon })"
    >
      Success with timeout
    </MButton>
    <MButton
      tone="info"
      @click.prevent="info('Notificaton with timeout', { timeout: 5000, title: 'And title', icon: ClockCheckIcon })"
    >
      Info with timeout
    </MButton>
  </div>
</template>

<script lang="ts" setup>
import { ClockCheckIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import { useNotifications } from '@/features/notifications'

const { error, warning, success, info, notify } = useNotifications()
</script>
