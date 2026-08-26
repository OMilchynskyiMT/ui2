<template>
  <MFormGrid :columns="1">
    <MCard>
      <MFormGrid :columns="1">
        <MSectionHeader>Server Configuration</MSectionHeader>

        <MFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
          <MSwitch
            v-model="form.status"
            class="grid-full"
            hint="Enable SMTP to allow your device to send email messages"
            label="Enabled"
          />

          <MTextField v-model="form.server" label="Server" />
          <MNumber v-model="form.port" label="Port" />

          <MCheckbox v-model="form.tls" hint="Enable or disable SSL/TLS for secured connections." label="TLS" />
          <MCheckbox
            v-model="form.startTls"
            hint="When enabled, the session starts with the normal protocol initialization, and TLS is then started using the protocol’s STARTTLS command. This setting is ignored if TLS is disabled."
            label="StartTLS"
          />
          <MCheckbox
            v-model="form.verify"
            hint="Activate server certificate verification using a list of trusted Certification Authorities (CAs)."
            label="Verify server certificate"
          />
        </MFormGrid>
      </MFormGrid>
    </MCard>

    <MCard>
      <MFormGrid :columns="1">
        <MSectionHeader>Authentication</MSectionHeader>

        <MFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
          <MSwitch v-model="form.auth.enabled" class="grid-full" label="Enabled" />

          <MTextField v-model="form.auth.username" label="Username">
            <template #leading><MIcon :icon="UserIcon" /></template>
          </MTextField>
          <MTextField v-model="form.auth.password" label="Password" type="password">
            <template #leading><MIcon :icon="LockIcon" /></template>
          </MTextField>
          <MTextField v-model="form.auth.email" label="Email" />

          <div class="grid-align-center">
            <MButton tone="primary" variant="tonal">
              <MIcon :icon="MailCheckIcon" />
              Send Test Email
            </MButton>
          </div>
        </MFormGrid>
      </MFormGrid>
    </MCard>

    <MCard>
      <MFormGrid :columns="1">
        <MSectionHeader>Mail Log Settings</MSectionHeader>

        <MFormGrid :columns="{ small: 1, medium: 2, extraLarge: 4 }">
          <MNumber v-model="form.maillog.entriesToKeep" label="Entries to keep" />
        </MFormGrid>
      </MFormGrid>
    </MCard>

    <MBottomActions adaptive>
      <MButton tone="primary">
        <MIcon :icon="CheckIcon" />
        Save
      </MButton>
    </MBottomActions>
  </MFormGrid>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CheckIcon, LockIcon, MailCheckIcon, UserIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import MCheckbox from '@/lib/components/fields/MCheckbox.vue'
import MNumber from '@/lib/components/fields/MNumber.vue'
import MSwitch from '@/lib/components/fields/MSwitch.vue'
import MTextField from '@/lib/components/fields/MTextField.vue'
import MFormGrid from '@/lib/components/grid/MFormGrid.vue'
import MBottomActions from '@/lib/components/mobile/MBottomActions.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MCard from '@/lib/components/section/MCard.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'

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
