<template>
  <UiFormGrid :columns="1">
    <UiCard>
      <UiFormGrid :columns="1">
        <UiSectionHeader>Server Configuration</UiSectionHeader>

        <UiFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
          <UiSwitch
            v-model="form.status"
            class="grid-full"
            hint="Enable SMTP to allow your device to send email messages"
            label="Enabled"
          />

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
        </UiFormGrid>
      </UiFormGrid>
    </UiCard>

    <UiCard>
      <UiFormGrid :columns="1">
        <UiSectionHeader>Authentication</UiSectionHeader>

        <UiFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
          <UiSwitch v-model="form.auth.enabled" class="grid-full" label="Enabled" />

          <UiTextField v-model="form.auth.username" label="Username">
            <template #leading><UiIcon :icon="UserIcon" /></template>
          </UiTextField>
          <UiPasswordField v-model="form.auth.password" label="Password" />
          <UiTextField v-model="form.auth.email" label="Email" />

          <div class="grid-align-center">
            <UiButton tone="primary" variant="tonal">
              <UiIcon :icon="MailCheckIcon" />
              Send Test Email
            </UiButton>
          </div>
        </UiFormGrid>
      </UiFormGrid>
    </UiCard>

    <UiCard>
      <UiFormGrid :columns="1">
        <UiSectionHeader>Mail Log Settings</UiSectionHeader>

        <UiFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
          <UiNumber v-model="form.maillog.entriesToKeep" label="Entries to keep" />
        </UiFormGrid>
      </UiFormGrid>
    </UiCard>

    <UiBottomActions adaptive>
      <UiButton tone="primary">
        <UiIcon :icon="CheckIcon" />
        Save
      </UiButton>
    </UiBottomActions>
  </UiFormGrid>
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
import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
import UiBottomActions from '@/lib/components/layout/UiBottomActions.vue'
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
