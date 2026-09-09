<template>
  <div class="notifications-view">
    <section>
      <MSectionHeader description="Immediate notifications for each feedback tone and a custom icon/title example">
        Notifications
      </MSectionHeader>

      <MCluster>
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
      </MCluster>
    </section>

    <section>
      <MSectionHeader description="Timed notifications with progress indication and optional title/icon content">
        Timeouts
      </MSectionHeader>

      <MCluster>
        <MButton tone="danger" @click.prevent="error('Notification with timeout', { timeout: 2000 })">
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
          @click.prevent="success('Notification with timeout', { timeout: 4000, icon: ClockCheckIcon })"
        >
          Success with timeout
        </MButton>
        <MButton
          tone="info"
          @click.prevent="
            info('Notification with timeout', { timeout: 5000, title: 'And title', icon: ClockCheckIcon })
          "
        >
          Info with timeout
        </MButton>
      </MCluster>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ClockCheckIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MCluster from '@/lib/components/layout/MCluster.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'
import { useNotifications } from '@/components/notifications'

const { error, warning, success, info, notify } = useNotifications()
</script>

<style scoped>
.notifications-view {
  min-inline-size: 0;
  display: grid;
  gap: var(--space-xxl);

  & > section {
    min-inline-size: 0;
    display: grid;
    gap: var(--space-xl);
  }
}
</style>
