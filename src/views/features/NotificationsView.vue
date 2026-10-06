<template>
  <UiStack gap="var(--space-xxl)">
    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Immediate notifications for each feedback tone and a custom icon/title example">
        Notifications
      </UiSectionHeader>

      <UiCluster>
        <UiButton @click.prevent="error('Error message')">Error</UiButton>
        <UiButton @click.prevent="warning('Warning message')">Warning</UiButton>
        <UiButton @click.prevent="success('Success message')">Success</UiButton>
        <UiButton @click.prevent="info('Info message')">Info</UiButton>
        <UiButton
          @click.prevent="
            notify('Notify message', {
              title: 'Custom notification',
              icon: ClockCheckIcon,
              tone: 'success',
            })
          "
        >
          Custom
        </UiButton>
      </UiCluster>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Timed notifications with progress indication and optional title/icon content">
        Timeouts
      </UiSectionHeader>

      <UiCluster>
        <UiButton tone="danger" @click.prevent="error('Notification with timeout', { timeout: 2000 })">
          Error with timeout
        </UiButton>
        <UiButton
          tone="warning"
          @click.prevent="
            warning(
              'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus placeat sint saepe magni quibusdam! Temporibus modi accusamus aliquam, in velit omnis doloremque sit consequuntur repudiandae aliquid sapiente, unde illo praesentium.',
              { timeout: 3000, title: 'And title' }
            )
          "
        >
          Warning with timeout
        </UiButton>
        <UiButton
          tone="success"
          @click.prevent="success('Notification with timeout', { timeout: 4000, icon: ClockCheckIcon })"
        >
          Success with timeout
        </UiButton>
        <UiButton
          tone="info"
          @click.prevent="
            info('Notification with timeout', { timeout: 5000, title: 'And title', icon: ClockCheckIcon })
          "
        >
          Info with timeout
        </UiButton>
      </UiCluster>
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import { ClockCheckIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import { useNotifications } from '@/components/notifications'

const { error, warning, success, info, notify } = useNotifications()
</script>
