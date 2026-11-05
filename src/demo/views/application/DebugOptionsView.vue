<template>
  <UiStack gap="var(--space-xxl)">
    <UiSectionHeader description="Configure logging, automatic reboot and network diagnostics">
      Debug Options
    </UiSectionHeader>

    <UiCard tag="section">
      <UiDisclosure
        v-model="rebootExpanded"
        description="Schedule a daily reboot or reboot automatically after a specified number of hours."
        title="Auto Reboot Timer"
        variant="plain"
      >
        <UiStack gap="var(--space-xl)">
          <UiGrid :columns="{ base: 1, medium: 2 }" gap="var(--space-lg)">
            <UiSelect v-model="settings.autoReboot.mode" :options="rebootModes" label="Auto Reboot" />
          </UiGrid>

          <UiGrid v-if="settings.autoReboot.mode === 'TIME'" :columns="{ base: 1, medium: 2 }" gap="var(--space-xl)">
            <UiTextField
              v-model="dailyRebootTime"
              :error="rebootTimeValidation.errors.value.time?.[0]"
              label="Time (HH:MM)"
              type="time"
            />
            <UiNumberField
              v-model="settings.autoReboot.interval"
              :error="rebootTimeValidation.errors.value.interval?.[0]"
              :max="120"
              :min="0"
              hint="0 means exactly at the specified time; otherwise 15-120 minutes."
              label="Variable Interval (Minutes)"
            />
          </UiGrid>

          <UiNumberField
            v-else-if="settings.autoReboot.mode === 'TIMER'"
            v-model="settings.autoReboot.hour"
            :error="rebootTimerValidation.errors.value.hour?.[0]"
            :max="99999"
            :min="1"
            label="Interval (Hours)"
          />
        </UiStack>
      </UiDisclosure>
    </UiCard>

    <UiCard tag="section">
      <UiDisclosure
        v-model="syslogExpanded"
        description="Forward device logs to a remote server. TLS options appear when an encrypted connection is selected."
        title="Remote Syslog"
        variant="plain"
      >
        <UiStack gap="var(--space-xl)">
          <UiSwitch
            v-model="settings.syslog.enabled"
            hint="Send log messages to a remote syslog server."
            label="Enabled"
          />

          <UiGrid :columns="{ base: 1, medium: 2 }" gap="var(--space-xl)">
            <UiTextField v-model="hostname" hint="Change this in Setup / Global DNS." label="Hostname" readonly />
            <UiTextField
              v-model="settings.syslog.ipAddress"
              :disabled="!settings.syslog.enabled"
              :error="syslogValidation.errors.value.ipAddress?.[0]"
              label="Server address"
            />
            <UiSelect
              v-model="settings.syslog.protocol"
              :disabled="!settings.syslog.enabled"
              :options="syslogProtocols"
              label="Protocol"
            />
            <UiNumberField
              v-model="settings.syslog.port"
              :disabled="!settings.syslog.enabled"
              :error="syslogValidation.errors.value.port?.[0]"
              :max="65535"
              :min="1"
              label="Port"
            />
          </UiGrid>

          <UiDisclosure
            v-if="settings.syslog.protocol === 'tls' && settings.syslog.enabled"
            v-model="securityExpanded"
            description="Choose protocol versions and enabled cipher suites in priority order."
            title="TLS security settings"
          >
            <UiStack gap="var(--space-lg)">
              <UiCluster gap="var(--space-xl)">
                <UiSwitch v-model="settings.tls.tls13" label="TLSv1.3" />
                <UiSwitch v-model="settings.tls.tls12" label="TLSv1.2" />
              </UiCluster>

              <UiCluster>
                <UiButton size="small" variant="tonal" @click="setAllCiphers(true)">Select all</UiButton>
                <UiButton size="small" variant="text" @click="setAllCiphers(false)">Clear all</UiButton>
              </UiCluster>

              <UiTable
                v-model:rows="ciphers"
                :columns="cipherColumns"
                aria-label="TLS cipher suite priority"
                mode="scroll"
                reorderable
                row-key="name"
              >
                <template #cell-enabled="{ row }">
                  <UiCheckbox v-model="row.enabled" :aria-label="`Enable ${row.name}`" />
                </template>
              </UiTable>
              <UiAlert v-if="tlsValidation.errors.value.$errors?.length" tone="danger">
                <p v-for="message in tlsValidation.errors.value.$errors" :key="message">{{ message }}</p>
              </UiAlert>
            </UiStack>
          </UiDisclosure>
        </UiStack>
      </UiDisclosure>
    </UiCard>

    <UiCard tag="section">
      <UiDisclosure
        v-model="loggingExpanded"
        description="Control log verbosity and download a local copy of the device logs."
        title="Logging"
        variant="plain"
      >
        <template #trailing>
          <UiButton :icon="DownloadIcon" size="small" variant="tonal" @click="demoAction('Log download')">
            Download Logs
          </UiButton>
        </template>

        <UiGrid :columns="{ base: 1, medium: 2 }" gap="var(--space-lg)">
          <UiSelect v-model="settings.syslog.logLevel" :options="logLevels" label="Debug Log Level" />
        </UiGrid>
      </UiDisclosure>
    </UiCard>

    <UiCard tag="section">
      <UiDisclosure
        v-model="trafficExpanded"
        description="Specify when accumulated traffic statistics are persisted."
        title="Data Traffic Statistics"
        variant="plain"
      >
        <UiGrid :columns="{ base: 1, medium: 2 }" gap="var(--space-xl)">
          <UiNumberField
            v-model="settings.syslog.saveTimeout"
            :error="trafficValidation.errors.value.saveTimeout?.[0]"
            :max="86400"
            :min="60"
            label="Save Timeout (Seconds)"
          />
          <UiNumberField
            v-model="settings.syslog.saveDataLimit"
            :error="trafficValidation.errors.value.saveDataLimit?.[0]"
            :max="100"
            :min="1"
            label="Save Data Limit (MB)"
          />
        </UiGrid>
      </UiDisclosure>
    </UiCard>

    <UiCard tag="section">
      <UiDisclosure
        v-model="pingExpanded"
        description="Check reachability through a selected interface. This diagnostic is independent of saved settings."
        title="Ping"
        variant="plain"
      >
        <template #trailing>
          <UiButton :icon="SendIcon" :loading="pingInProgress" size="small" @click="runPing">Ping</UiButton>
        </template>

        <UiStack gap="var(--space-xl)">
          <UiGrid :columns="{ base: 1, medium: 2 }" gap="var(--space-xl)">
            <UiTextField
              v-model="ping.ip"
              :disabled="pingInProgress"
              :error="pingValidation.errors.value.ip?.[0]"
              label="IP Address or Hostname"
            />
            <UiSelect
              v-model="ping.interface"
              :disabled="pingInProgress"
              :error="pingValidation.errors.value.interface?.[0]"
              :options="networkInterfaces"
              label="Network Interface"
            />
            <UiNumberField
              v-model="ping.requests"
              :disabled="pingInProgress"
              :error="pingValidation.errors.value.requests?.[0]"
              :max="120"
              :min="1"
              label="Number of Requests"
            />
            <UiNumberField
              v-model="ping.packetSize"
              :disabled="pingInProgress"
              :error="pingValidation.errors.value.packetSize?.[0]"
              :max="65507"
              :min="0"
              label="Packet Size (Bytes)"
            />
            <UiGridItem span="full">
              <div class="option-cell">
                <UiCheckbox
                  v-model="ping.doNotFragment"
                  :disabled="pingInProgress"
                  hint="Fail instead of fragmenting packets exceeding the interface MTU."
                  label="Do Not Fragment"
                />
              </div>
            </UiGridItem>
          </UiGrid>
        </UiStack>
      </UiDisclosure>
    </UiCard>

    <UiCard tag="section">
      <UiDisclosure
        v-model="continuousExpanded"
        description="Start a continuous reachability check and stop it when no longer needed."
        title="Continuous Ping"
        variant="plain"
      >
        <template #trailing>
          <UiButton
            v-if="!continuousActive"
            :icon="PlayIcon"
            :loading="continuousPhase === 'starting'"
            size="small"
            @click="startContinuousPing"
          >
            Start Continuous Ping
          </UiButton>
          <UiButton
            v-else
            :icon="SquareIcon"
            :loading="continuousPhase === 'stopping'"
            size="small"
            tone="danger"
            variant="tonal"
            @click="stopContinuousPing"
          >
            Stop Continuous Ping
          </UiButton>
        </template>

        <UiStack gap="var(--space-xl)">
          <UiGrid :columns="{ base: 1, medium: 2 }" gap="var(--space-xl)">
            <UiTextField
              v-model="continuousPing.ip"
              :disabled="continuousBusy"
              :error="continuousValidation.errors.value.ip?.[0]"
              label="IP Address or Hostname"
            />
            <UiSelect
              v-model="continuousPing.interface"
              :disabled="continuousBusy"
              :error="continuousValidation.errors.value.interface?.[0]"
              :options="networkInterfaces"
              label="Network Interface"
            />
            <UiNumberField
              v-model="continuousPing.packetSize"
              :disabled="continuousBusy"
              :error="continuousValidation.errors.value.packetSize?.[0]"
              :max="65507"
              :min="0"
              label="Packet Size (Bytes)"
            />
            <div class="option-cell">
              <UiCheckbox
                v-model="continuousPing.doNotFragment"
                :disabled="continuousBusy"
                hint="Prevent fragmentation of oversized packets."
                label="Do Not Fragment"
              />
            </div>
          </UiGrid>
          <p v-if="continuousPingStatus" role="status" aria-live="polite" class="ping-status">
            {{ continuousPingStatus }}
          </p>
        </UiStack>
      </UiDisclosure>
    </UiCard>

    <UiBottomActions adaptive>
      <UiButton :disabled="!hasChanges" :icon="CheckIcon" @click="save">Save</UiButton>
    </UiBottomActions>
  </UiStack>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { CheckIcon, DownloadIcon, PlayIcon, SendIcon, SquareIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiDisclosure from '@/lib/components/disclosure/UiDisclosure.vue'
import UiCheckbox from '@/lib/components/fields/UiCheckbox.vue'
import UiNumberField from '@/lib/components/fields/UiNumberField.vue'
import UiSelect from '@/lib/components/fields/UiSelect.vue'
import UiSwitch from '@/lib/components/fields/UiSwitch.vue'
import UiTextField from '@/lib/components/fields/UiTextField.vue'
import UiGrid from '@/lib/components/grid/UiGrid.vue'
import UiGridItem from '@/lib/components/grid/UiGridItem.vue'
import UiBottomActions from '@/lib/components/layout/UiBottomActions.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiAlert from '@/lib/components/status/UiAlert.vue'
import type { TableColumn } from '@/lib/components/table/table.types'
import UiTable from '@/lib/components/table/UiTable.vue'
import {
  domainOrIpAddress,
  integer,
  matches,
  numberInRange,
  numberInRanges,
  Schema,
  types,
  useValidation,
} from '@/lib/validation'
import { useNotifications } from '@/components/notifications'

type Cipher = { name: string; version: 'TLSv1.2' | 'TLSv1.3'; enabled: boolean }
type PingOptions = { ip: string; interface: string; packetSize: number; doNotFragment: boolean }
type TlsValidation = { tls12: boolean; tls13: boolean; ciphers: Cipher[] }

const { info, success } = useNotifications()
const hostname = ref('conduit-ap')
const securityExpanded = ref(false)
const rebootExpanded = ref(true)
const loggingExpanded = ref(true)
const syslogExpanded = ref(true)
const trafficExpanded = ref(false)
const pingExpanded = ref(true)
const continuousExpanded = ref(true)
const settings = reactive({
  autoReboot: { mode: 'TIME', hour: 3, minute: 30, interval: 0 },
  syslog: {
    enabled: true,
    ipAddress: '192.168.2.10',
    protocol: 'tls',
    port: 6514,
    logLevel: 30,
    saveTimeout: 600,
    saveDataLimit: 30,
  },
  tls: { tls12: true, tls13: true },
})
const ciphers = ref<Cipher[]>([
  { name: 'TLS_AES_256_GCM_SHA384', version: 'TLSv1.3', enabled: true },
  { name: 'TLS_AES_128_GCM_SHA256', version: 'TLSv1.3', enabled: true },
  { name: 'TLS_CHACHA20_POLY1305_SHA256', version: 'TLSv1.3', enabled: true },
  { name: 'ECDHE-RSA-AES256-GCM-SHA384', version: 'TLSv1.2', enabled: true },
  { name: 'ECDHE-RSA-AES128-GCM-SHA256', version: 'TLSv1.2', enabled: true },
])
const ping = reactive<PingOptions & { requests: number }>({
  ip: '1.1.1.1',
  interface: 'ANY',
  packetSize: 56,
  doNotFragment: false,
  requests: 4,
})
const continuousPing = reactive<PingOptions>({
  ip: '1.1.1.1',
  interface: 'ANY',
  packetSize: 56,
  doNotFragment: false,
})

type RegularPingPhase = 'idle' | 'submitting' | 'running' | 'complete'
type ContinuousPingPhase = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped'

const regularPingPhase = ref<RegularPingPhase>('idle')
const pingInProgress = computed(() => regularPingPhase.value === 'submitting' || regularPingPhase.value === 'running')

const continuousPhase = ref<ContinuousPingPhase>('idle')
const continuousActive = computed(() => continuousPhase.value === 'running' || continuousPhase.value === 'stopping')
const continuousBusy = computed(() => continuousPhase.value !== 'idle' && continuousPhase.value !== 'stopped')
const continuousSummary = ref('')
const continuousPingStatus = computed(() => {
  switch (continuousPhase.value) {
    case 'starting': {
      return 'Starting continuous ping (demo)...'
    }
    case 'running': {
      return `Ping ${continuousPing.ip} is in progress...`
    }
    case 'stopping': {
      return 'Stopping continuous ping (demo)...'
    }
    case 'stopped': {
      return `Ping Results (simulated): ${continuousSummary.value}`
    }
    default: {
      return ''
    }
  }
})

let regularSubmitTimer: ReturnType<typeof setTimeout> | undefined
let regularPollTimer: ReturnType<typeof setInterval> | undefined
let continuousCommandTimer: ReturnType<typeof setTimeout> | undefined
let continuousStartedAt = 0

onBeforeUnmount(() => {
  clearTimeout(regularSubmitTimer)
  clearInterval(regularPollTimer)
  clearTimeout(continuousCommandTimer)
})

const rebootModes = [
  { value: 'DISABLED', title: 'Disabled' },
  { value: 'TIME', title: 'Daily' },
  { value: 'TIMER', title: 'Timer' },
]
const syslogProtocols = [
  { value: 'udp', title: 'UDP' },
  { value: 'tcp', title: 'TCP' },
  { value: 'tls', title: 'SSL/TLS' },
]
const logLevels = [
  { value: 0, title: 'Minimum' },
  { value: 10, title: 'Error' },
  { value: 20, title: 'Warning' },
  { value: 30, title: 'Info' },
  { value: 50, title: 'Debug' },
  { value: 100, title: 'Maximum' },
]
const networkInterfaces = [
  { value: 'ANY', title: 'Any' },
  { value: 'LAN', title: 'Bridge (br0)' },
  { value: 'CELLULAR', title: 'Cellular' },
  { value: 'WIFI-WAN', title: 'Wi-Fi WAN' },
  { value: 'WIFI-AP', title: 'Wi-Fi AP' },
  { value: 'ETH0', title: 'Ethernet (eth0)' },
  { value: 'ETH1', title: 'Ethernet (eth1)' },
]
const cipherColumns: TableColumn<Cipher>[] = [
  { key: 'enabled', label: 'Enabled', width: '6rem' },
  { key: 'name', label: 'Cipher Suite', rowHeader: true },
  { key: 'version', label: 'TLS Version', width: '7rem' },
]
const dailyRebootTime = computed({
  get: () =>
    `${String(settings.autoReboot.hour).padStart(2, '0')}:${String(settings.autoReboot.minute).padStart(2, '0')}`,
  set: value => {
    const [hour, minute] = value.split(':').map(Number)
    settings.autoReboot.hour = hour ?? NaN
    settings.autoReboot.minute = minute ?? NaN
  },
})

const currentSnapshot = () => JSON.stringify({ settings, ciphers: ciphers.value })
const savedSnapshot = ref(currentSnapshot())
const hasChanges = computed(() => currentSnapshot() !== savedSnapshot.value)

const rebootTimeFields = {
  time: types.string(matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { message: 'Enter a valid 24-hour time.' })),
  interval: types.number(
    integer(),
    numberInRanges([[15, 120]], { include: [0], message: 'Use 0 or a value between 15 and 120.' })
  ),
}
const rebootTimeSchema = new Schema(types.object(rebootTimeFields))
const rebootTimeValidation = useValidation(
  rebootTimeSchema,
  computed(() => ({ time: dailyRebootTime.value, interval: settings.autoReboot.interval }))
)

const rebootTimerFields = {
  hour: types.number(integer(), numberInRange(1, 99_999, { message: 'Enter a whole number between 1 and 99999.' })),
}
const rebootTimerSchema = new Schema(types.object(rebootTimerFields))
const rebootTimerValidation = useValidation(
  rebootTimerSchema,
  computed(() => ({ hour: settings.autoReboot.hour }))
)

const syslogFields = {
  ipAddress: types.string(domainOrIpAddress({ message: 'Enter a valid IP address or hostname.' })),
  port: types.number(integer(), numberInRange(1, 65_535, { message: 'Port must be between 1 and 65535.' })),
}
const syslogSchema = new Schema(types.object(syslogFields))
const syslogValidation = useValidation(
  syslogSchema,
  computed(() => ({ ipAddress: settings.syslog.ipAddress, port: settings.syslog.port }))
)

const trafficFields = {
  saveTimeout: types.number(integer(), numberInRange(60, 86_400, { message: 'Allowed range: 60-86400 seconds.' })),
  saveDataLimit: types.number(integer(), numberInRange(1, 100, { message: 'Allowed range: 1-100 MB.' })),
}
const trafficSchema = new Schema(types.object(trafficFields))
const trafficValidation = useValidation(
  trafficSchema,
  computed(() => ({
    saveTimeout: settings.syslog.saveTimeout,
    saveDataLimit: settings.syslog.saveDataLimit,
  }))
)

const cipherNode = types.object<Cipher>({
  name: types.string(),
  version: types.enum(['TLSv1.2', 'TLSv1.3']),
  enabled: types.boolean(),
})
const tlsFields = {
  tls12: types.boolean(),
  tls13: types.boolean(),
  ciphers: types.array(cipherNode),
}
const tlsSchema = new Schema(
  types.object<TlsValidation>(
    tlsFields,
    {
      code: 'tls.version',
      message: 'Enable at least one TLS version.',
      validate: value => value.tls12 || value.tls13,
    },
    {
      code: 'tls.cipher12',
      message: 'Enable at least one TLSv1.2 cipher suite.',
      validate: value => !value.tls12 || value.ciphers.some(cipher => cipher.version === 'TLSv1.2' && cipher.enabled),
    },
    {
      code: 'tls.cipher13',
      message: 'Enable at least one TLSv1.3 cipher suite.',
      validate: value => !value.tls13 || value.ciphers.some(cipher => cipher.version === 'TLSv1.3' && cipher.enabled),
    }
  )
)
const tlsValidation = useValidation(
  tlsSchema,
  computed(() => ({ ...settings.tls, ciphers: ciphers.value }))
)

const pingFields = {
  ip: types.string(domainOrIpAddress({ message: 'Enter a valid IP address or hostname.' })),
  interface: types.string(),
  packetSize: types.number(integer(), numberInRange(0, 65_507, { message: 'Allowed range: 0-65507 bytes.' })),
  doNotFragment: types.boolean(),
}
const regularPingFields = {
  ...pingFields,
  requests: types.number(integer(), numberInRange(1, 120, { message: 'Allowed range: 1-120.' })),
}
const pingSchema = new Schema(types.object<PingOptions & { requests: number }>(regularPingFields))
const continuousSchema = new Schema(types.object<PingOptions>(pingFields))
const pingValidation = useValidation(pingSchema, ping)
const continuousValidation = useValidation(continuousSchema, continuousPing)

watch(
  () => settings.autoReboot.mode,
  mode => {
    if (mode !== 'TIME') rebootTimeValidation.clear()
    if (mode !== 'TIMER') rebootTimerValidation.clear()
  }
)

watch(
  () => [settings.syslog.enabled, settings.syslog.protocol],
  () => {
    if (!settings.syslog.enabled) syslogValidation.clear()
    if (!settings.syslog.enabled || settings.syslog.protocol !== 'tls') tlsValidation.clear()
  }
)

const validateSettings = (): boolean => {
  const mode = settings.autoReboot.mode
  const rebootValid =
    (mode !== 'TIME' || rebootTimeValidation.validate().valid) &&
    (mode !== 'TIMER' || rebootTimerValidation.validate().valid)
  const syslogValid = !settings.syslog.enabled || syslogValidation.validate().valid
  const tlsValid = !settings.syslog.enabled || settings.syslog.protocol !== 'tls' || tlsValidation.validate().valid
  const trafficValid = trafficValidation.validate().valid

  if (!rebootValid) rebootExpanded.value = true
  if (!syslogValid || !tlsValid) syslogExpanded.value = true
  if (!tlsValid) securityExpanded.value = true
  if (!trafficValid) trafficExpanded.value = true

  return rebootValid && syslogValid && tlsValid && trafficValid
}

const setAllCiphers = (isEnabled: boolean) => {
  for (const cipher of ciphers.value) {
    const versionEnabled =
      (cipher.version === 'TLSv1.3' && settings.tls.tls13) || (cipher.version === 'TLSv1.2' && settings.tls.tls12)
    if (!isEnabled || versionEnabled) cipher.enabled = isEnabled
  }
}
const demoAction = (action: string) => info(`${action} is not connected to a device in the demo build!`)
const runPing = () => {
  if (pingInProgress.value) return
  if (!pingValidation.validate().valid) {
    pingExpanded.value = true
    return
  }
  pingExpanded.value = true

  // POST /api/command/ping, then poll stats/service/ping every five seconds
  regularPingPhase.value = 'submitting'
  regularSubmitTimer = setTimeout(() => {
    regularPingPhase.value = 'running'
    regularPollTimer = setInterval(() => {
      clearInterval(regularPollTimer)
      regularPingPhase.value = 'complete'
      success(
        `${ping.ip} Transmitted (4) Received (4) MIN/AVG/MAX (0/0/0) milliseconds (${new Date().toLocaleString()})`,
        { title: 'Ping Results' }
      )
    }, 5000)
  }, 700)
}

const startContinuousPing = () => {
  if (continuousBusy.value) return
  if (!continuousValidation.validate().valid) {
    continuousExpanded.value = true
    return
  }
  continuousExpanded.value = true
  continuousSummary.value = ''
  // POST /api/command/continuous_ping_start
  continuousPhase.value = 'starting'
  continuousCommandTimer = setTimeout(() => {
    continuousStartedAt = Date.now()
    continuousPhase.value = 'running'
  }, 700)
}

const stopContinuousPing = () => {
  if (continuousPhase.value !== 'running') return
  continuousExpanded.value = true
  // POST /api/command/continuous_ping_stop, only the response supplies a summary
  continuousPhase.value = 'stopping'
  continuousCommandTimer = setTimeout(() => {
    const sent = Math.max(1, Math.floor((Date.now() - continuousStartedAt) / 1000))
    continuousSummary.value = `${sent} packets transmitted, ${sent} received, 0% packet loss`
    continuousPhase.value = 'stopped'
  }, 700)
}
const save = () => {
  if (!validateSettings()) return
  savedSnapshot.value = currentSnapshot()
  info('Demo settings saved in this view only, no device configuration was changed')
}
</script>

<style scoped>
@layer components {
  .ping-status {
    color: var(--text-color-dimmed);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .option-cell {
    display: flex;
    min-block-size: 3rem;
    align-items: center;
  }
}
</style>
