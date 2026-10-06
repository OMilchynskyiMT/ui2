<template>
  <UiStack class="dashboard-view">
    <UiStack gap="var(--space-lg)" tag="section">
      <UiSectionHeader :icon="GaugeIcon" description="Current device health, identity and operating state">
        Device information
      </UiSectionHeader>

      <DeviceSummary v-bind="device" />
    </UiStack>

    <UiStack gap="var(--space-lg)" tag="section">
      <UiSectionHeader :icon="Globe2Icon" description="Traffic, uplink state and local network configuration">
        Connectivity
      </UiSectionHeader>

      <UiAutoGrid align="start" gap="var(--space-lg)" min-item-size="calc(var(--container-md) / 2)">
        <TrafficOverview
          :chart="trafficChart"
          :format-label="formatTrafficLabel"
          :format-value="formatTrafficValue"
          label="Received and transmitted network traffic"
          period="7 days"
        />
        <ConnectivityOverview v-bind="internet" />
      </UiAutoGrid>
    </UiStack>

    <UiStack gap="var(--space-lg)" tag="section">
      <UiAutoGrid
        v-if="networkGroups.length > 0"
        :max-columns="2"
        align="start"
        gap="var(--space-xl)"
        min-item-size="calc(var(--container-md) / 2)"
      >
        <UiStack v-for="group in networkGroups" :key="group.id" gap="var(--space-lg)">
          <DashboardCardHeader :description="group.description" :icon="group.icon" :title="group.title" />
          <UiStack gap="var(--space-lg)">
            <NetworkBridgeCard v-if="group.bridge" v-bind="group.bridge" />
            <NetworkAdapterCard
              v-for="adapter in group.adapters"
              :key="`${adapter.kind}-${adapter.name}`"
              :adapter="adapter"
            />
          </UiStack>
        </UiStack>
      </UiAutoGrid>
    </UiStack>

    <UiStack v-if="loraModule" gap="var(--space-lg)" tag="section">
      <UiSectionHeader :icon="RadioTowerIcon" description="LoRa gateway hardware identity and radio band">
        LoRa
      </UiSectionHeader>
      <UiAutoGrid
        :max-columns="2"
        gap="var(--space-xl)"
        min-item-size="calc(var(--container-md) / 2)"
        repeat="auto-fill"
      >
        <LoraSummary v-bind="loraModule" />
      </UiAutoGrid>
    </UiStack>

    <UiStack gap="var(--space-lg)" tag="section">
      <UiSectionHeader :icon="MemoryStickIcon" description="Memory and persistent storage consumption">
        System resources
      </UiSectionHeader>
      <UiStack gap="var(--space-lg)">
        <CapacityUsage :icon="MemoryStickIcon" :segments="memorySegments" :total="gibibytes(2)" title="Memory" />
        <UiAutoGrid
          v-if="storageVolumes.length > 0"
          gap="var(--space-lg)"
          min-item-size="calc(var(--container-md) / 3)"
        >
          <CapacityUsage
            v-for="(volume, index) in storageVolumes"
            :key="volume.title"
            :segments="volume.segments"
            :style="{ '--accent-color': storages[index] }"
            :title="volume.title"
            :total="volume.total"
          />
        </UiAutoGrid>
      </UiStack>
    </UiStack>

    <UiStack v-if="services.length > 0" gap="var(--space-lg)" tag="section">
      <UiSectionHeader :icon="FileBoxIcon" description="Configuration and runtime state of device services">
        Services
      </UiSectionHeader>

      <ServiceStatusList :services />
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import {
  FileBoxIcon,
  GaugeIcon,
  Globe2Icon,
  GlobeIcon,
  MemoryStickIcon,
  NetworkIcon,
  RadioTowerIcon,
} from '@lucide/vue'
import type { Component } from 'vue'

import UiAutoGrid from '@/lib/components/grid/UiAutoGrid.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import { formatBytes } from '@/lib/format/bytes'
import type { ChartDefinition, ChartLabel } from '@/components/chart'
import ConnectivityOverview from '@/components/dashboard/ConnectivityOverview.vue'
import DashboardCardHeader from '@/components/dashboard/DashboardCardHeader.vue'
import DeviceSummary from '@/components/dashboard/DeviceSummary.vue'
import LoraSummary from '@/components/dashboard/LoraSummary.vue'
import NetworkAdapterCard from '@/components/dashboard/NetworkAdapterCard.vue'
import NetworkBridgeCard from '@/components/dashboard/NetworkBridgeCard.vue'
import ServiceStatusList, { type DashboardService } from '@/components/dashboard/ServiceStatusList.vue'
import TrafficOverview from '@/components/dashboard/TrafficOverview.vue'
import type { NetworkAdapterCardProperties, NetworkBridgeCardProperties } from '@/components/dashboard/types'
import CapacityUsage, { type CapacityUsageSegment } from '@/components/indicators/CapacityUsage.vue'

const storages = ['var(--data-color-1)', 'var(--data-color-2)', 'var(--data-color-3)']
const mebibytes = (value: number): number => value * 1024 ** 2
const gibibytes = (value: number): number => value * 1024 ** 3

type StorageVolume = Readonly<{
  title: string
  total: number
  segments: readonly CapacityUsageSegment[]
}>

type NetworkGroup = Readonly<{
  id: 'wan' | 'lan'
  title: string
  description: string
  icon: Component
  bridge?: NetworkBridgeCardProperties
  adapters: readonly NetworkAdapterCardProperties[]
}>

type LoraModule = Readonly<{
  modelNumber: string
  hardware: string
  eui: string
  frequencyBand: string
}>

const device = {
  modelNumber: 'MTCAP3-L4G2D-WIFI',
  serialNumber: 'DV200055',
  imei: '016666004006201',
  customName: 'mPower™ Edge Intelligence Conduit AP',
  firmwareVersion: '8.0.0-dev1',
  currentTime: '6/22/2026, 12:56:30 AM',
  uptime: '10 days 21:02:29',
  imageSrc: 'logo/pMower_UI_390x234_Conduit_AP.png',
}

const internet = {
  online: false,
  wanTransport: 'None',
  currentDns: 'Not Acquired',
}

const trafficStart = new Date(2026, 8, 16).getTime()
const trafficLabels = Array.from({ length: 7 }, (_, index) => trafficStart + index * 24 * 60 * 60 * 1000)
const receivedTraffic = [420, 510, 380, 610, 540, 730, 680].map(element => mebibytes(element))
const transmittedTraffic = [110, 140, 95, 165, 130, 190, 175].map(element => mebibytes(element))

const trafficChart: ChartDefinition = {
  type: 'line',
  labels: trafficLabels,
  series: [
    {
      id: 'received',
      label: 'Received',
      values: receivedTraffic,
      color: '--cyan-500',
    },
    {
      id: 'transmitted',
      label: 'Transmitted',
      values: transmittedTraffic,
      color: '--orange-400',
    },
  ],
}

const trafficDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

const formatTrafficLabel = (value: ChartLabel): string => {
  return typeof value === 'number' ? trafficDateFormatter.format(value) : value
}

const formatTrafficValue = (value: number): string => formatBytes(value, { unitSystem: 'decimal' })

const networkBridge: NetworkBridgeCardProperties | undefined = {
  name: 'br0',
  mac: '00:08:00:22:55:20',
  ipv4: '192.168.2.1',
  mask: '255.255.255.0',
  dhcpState: 'Enabled',
  leaseRange: '192.168.2.100-192.168.2.254',
  interfaces: ['eth0', 'wlan1'],
}

const networkAdapters: readonly NetworkAdapterCardProperties[] = [
  {
    kind: 'cellular',
    role: 'wan',
    name: 'ppp0',
    state: 'Idle - no SIM',
    networkRegistration: 'Searching',
    signal: {
      level: 3,
      steps: 5,
      value: '-93 dBm',
      title: 'Cellular signal: -93 dBm',
    },
    connected: '00:00:00',
    ipv4: 'Not Acquired',
    phoneNumber: 'Not Supported',
  },
  {
    kind: 'wifi',
    role: 'wan',
    name: 'wlan0',
    state: 'No saved networks',
    mode: 'DHCP Client',
    mac: '20:BA:36:5C:D7:B1',
  },
  {
    kind: 'ethernet',
    role: 'lan',
    name: 'eth0',
    state: 'Enabled',
    bridge: 'br0',
    mac: '00:08:00:22:55:20',
  },
  {
    kind: 'wifi',
    role: 'lan',
    name: 'wlan1',
    state: 'Disabled',
  },
]

const wanAdapters = networkAdapters
  .filter(adapter => adapter.role === 'wan')
  .toSorted((left, right) => Number(Boolean(right.current)) - Number(Boolean(left.current)))
const lanAdapters = networkAdapters.filter(adapter => adapter.role === 'lan')

const allNetworkGroups: readonly NetworkGroup[] = [
  {
    id: 'wan',
    title: 'WAN',
    description: 'External uplink interfaces',
    icon: GlobeIcon,
    adapters: wanAdapters,
  },
  {
    id: 'lan',
    title: 'LAN',
    description: 'Local interfaces and bridge configuration',
    icon: NetworkIcon,
    bridge: networkBridge,
    adapters: lanAdapters,
  },
]

const networkGroups = allNetworkGroups.filter(group => group.bridge ?? group.adapters.length > 0)

const loraModule: LoraModule | undefined = {
  modelNumber: 'MTCAP3-003E00',
  hardware: 'MTCAP3-003-0.2',
  eui: '00-80-00-00-D0-33-42-55',
  frequencyBand: '868',
}

const memorySegments: CapacityUsageSegment[] = [
  { label: 'Used', value: mebibytes(890) },
  { label: 'Buff/cache', value: mebibytes(460) },
  { label: 'Shared', value: mebibytes(110) },
]

const storageVolumes: readonly StorageVolume[] = [
  {
    title: 'User Data Partition',
    total: gibibytes(1),
    segments: [{ label: 'Used', value: mebibytes(150) }],
  },
  {
    title: '/var/config',
    total: mebibytes(256),
    segments: [{ label: 'Used', value: mebibytes(18) }],
  },
  {
    title: '/var/oem',
    total: mebibytes(128),
    segments: [{ label: 'Used', value: mebibytes(42) }],
  },
]

const services: DashboardService[] = [
  { label: 'DDNS', active: false },
  { label: 'SNTP', active: true },
  { label: 'TCP/ICMP Keep Alive', active: true },
  { label: 'Dial-on-Demand', active: false },
  { label: 'SMTP', active: false },
  { label: 'SMS', active: true },
  { label: 'Failover', active: true },
  { label: 'SNMP Server', active: false },
  { label: 'Security Violation', active: true },
  { label: 'Reverse SSH Tunnel', active: false },
  { label: 'MQTT Broker', active: true },
  { label: 'Remote Management', active: true },
  { label: 'LLDP', active: true },
  { label: 'Continuous Ping', active: false },
]
</script>

<style scoped>
.dashboard-view {
  --section-header-icon-size: 1.625rem;
  --stack-gap: var(--space-3xl);

  @media (width < container-token(--container-md)) {
    --stack-gap: var(--space-xxl);
  }
}
</style>
