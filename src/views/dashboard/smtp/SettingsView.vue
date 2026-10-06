<template>
  <UiStack gap="var(--space-xxl)">
    <UiCard>
      <UiStack gap="var(--space-xxl)">
        <UiSectionHeader>Server Configuration</UiSectionHeader>

        <UiGrid :columns="{ base: 1, medium: 2, extraLarge: 4 }" gap="var(--space-xxl)">
          <UiGridItem span="full">
            <UiSwitch
              v-model="form.status"
              hint="Enable SMTP to allow your device to send email messages"
              label="Enabled"
            />
          </UiGridItem>

          <UiTextField v-model="form.server" label="Server" />
          <UiNumber v-model="form.port" label="Port" />

          <UiCheckbox v-model="form.tls" hint="Enable or disable SSL/TLS for secured connections." label="TLS" />
          <UiCheckbox
            v-model="form.startTls"
            hint="When enabled, the session starts with the normal protocol initialization, and TLS is then started using the protocol’s STARTTLS command. This setting is ignored if TLS is disabled."
            label="StartTLS"
          />
          <UiCheckbox
            v-model="form.verify"
            hint="Activate server certificate verification using a list of trusted Certification Authorities (CAs)."
            label="Verify server certificate"
          />
        </UiGrid>
      </UiStack>
    </UiCard>

    <UiCard>
      <UiStack gap="var(--space-xxl)">
        <UiSectionHeader>Authentication</UiSectionHeader>

        <UiGrid :columns="{ base: 1, medium: 2, extraLarge: 4 }" gap="var(--space-xxl)">
          <UiGridItem span="full">
            <UiSwitch v-model="form.auth.enabled" label="Enabled" />
          </UiGridItem>

          <UiTextField v-model="form.auth.username" label="Username">
            <template #leading><UiIcon :icon="UserIcon" /></template>
          </UiTextField>
          <UiPasswordField v-model="form.auth.password" label="Password" />
          <UiTextField v-model="form.auth.email" label="Email" />

          <UiGridItem align="center">
            <UiButton :icon="MailCheckIcon" tone="primary" variant="tonal">Send Test Email</UiButton>
          </UiGridItem>
        </UiGrid>
      </UiStack>
    </UiCard>

    <UiCard>
      <UiStack gap="var(--space-xxl)">
        <UiSectionHeader>Mail Log Settings</UiSectionHeader>

        <UiGrid :columns="{ base: 1, medium: 2, extraLarge: 4 }" gap="var(--space-xxl)">
          <UiNumber v-model="form.maillog.entriesToKeep" label="Entries to keep" />
        </UiGrid>
      </UiStack>
    </UiCard>

    <UiBottomActions adaptive>
      <UiButton :icon="CheckIcon" tone="primary">Save</UiButton>
    </UiBottomActions>
  </UiStack>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CheckIcon, MailCheckIcon, UserIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiCheckbox from '@/lib/components/fields/UiCheckbox.vue'
import UiNumber from '@/lib/components/fields/UiNumberField.vue'
import UiPasswordField from '@/lib/components/fields/UiPasswordField.vue'
import UiSwitch from '@/lib/components/fields/UiSwitch.vue'
import UiTextField from '@/lib/components/fields/UiTextField.vue'
import UiGrid from '@/lib/components/grid/UiGrid.vue'
import UiGridItem from '@/lib/components/grid/UiGridItem.vue'
import UiBottomActions from '@/lib/components/layout/UiBottomActions.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiIcon from '@/lib/components/UiIcon.vue'

const form = ref<{
  status: boolean
  server: string
  port: number
  tls: boolean
  startTls: boolean
  verify: boolean
  auth: {
    enabled: boolean
    username: string
    password: string
    email: string
  }
  maillog: {
    entriesToKeep: number
  }
}>({
  status: true,
  server: '',
  port: 465,
  tls: true,
  startTls: false,
  verify: false,
  auth: {
    enabled: false,
    username: '',
    password: '',
    email: '',
  },
  maillog: {
    entriesToKeep: 50,
  },
})
</script>
