<template>
  <UiStack class="dashboard-widgets-view" gap="var(--space-xxl)">
    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Compact connection state with clear tonal emphasis">
        Internet status
      </UiSectionHeader>

      <UiAutoGrid gap="var(--space-lg)" min-item-size="20rem">
        <NetworkStatus online />
        <NetworkStatus :online="false" />
      </UiAutoGrid>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Segmented resource meters with totals and hover details">
        Capacity usage
      </UiSectionHeader>

      <UiStack gap="var(--space-lg)">
        <CapacityUsage :icon="MemoryStickIcon" :segments="memorySegments" :total="gibibytes(2)" title="Memory" />

        <UiAutoGrid gap="var(--space-lg)" min-item-size="16rem">
          <CapacityUsage
            v-for="volume in storageVolumes"
            :key="volume.title"
            :segments="volume.segments"
            :title="volume.title"
            :total="volume.total"
          />
        </UiAutoGrid>
      </UiStack>
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import { MemoryStickIcon } from '@lucide/vue'

import UiAutoGrid from '@/lib/components/grid/UiAutoGrid.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import CapacityUsage, { type CapacityUsageSegment } from '@/components/indicators/CapacityUsage.vue'
import NetworkStatus from '@/components/indicators/NetworkStatus.vue'

const mebibytes = (value: number): number => value * 1024 ** 2
const gibibytes = (value: number): number => value * 1024 ** 3

type StorageVolume = Readonly<{
  title: string
  total: number
  segments: readonly CapacityUsageSegment[]
}>

const memorySegments: CapacityUsageSegment[] = [
  { label: 'Used', value: mebibytes(890) },
  { label: 'Buff/Cache', value: mebibytes(460) },
  { label: 'Shared', value: mebibytes(110) },
]

const storageVolumes: readonly StorageVolume[] = [
  {
    title: 'User Data Partition',
    total: gibibytes(4),
    segments: [{ label: 'Used', value: mebibytes(1650) }],
  },
  {
    title: '/var/config',
    total: mebibytes(256),
    segments: [{ label: 'Used', value: mebibytes(118) }],
  },
  {
    title: '/var/oem',
    total: mebibytes(128),
    segments: [{ label: 'Used', value: mebibytes(42) }],
  },
]
</script>
