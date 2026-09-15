<template>
  <div class="dashboard-widgets-view">
    <section>
      <UiSectionHeader description="Compact connection state with clear tonal emphasis">
        Internet status
      </UiSectionHeader>

      <div class="status-grid">
        <NetworkStatus online />
        <NetworkStatus :online="false" />
      </div>
    </section>

    <section>
      <UiSectionHeader description="Segmented resource meters with totals and hover details">
        Capacity usage
      </UiSectionHeader>

      <div class="usage-grid">
        <CapacityUsage
          :icon="MemoryStickIcon"
          :segments="memorySegments"
          :total="gibibytes(2)"
          class="wide"
          title="Memory"
        />
        <CapacityUsage
          :segments="[{ label: 'Used', value: mebibytes(1650) }]"
          :total="gibibytes(4)"
          title="User Data Partition"
        />
        <CapacityUsage
          :segments="[{ label: 'Used', value: mebibytes(118) }]"
          :total="mebibytes(256)"
          title="/var/config"
        />
        <CapacityUsage :segments="[{ label: 'Used', value: mebibytes(42) }]" :total="mebibytes(128)" title="/var/oem" />
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { MemoryStickIcon } from '@lucide/vue'

import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import CapacityUsage, { type CapacityUsageSegment } from '@/components/indicators/CapacityUsage.vue'
import NetworkStatus from '@/components/indicators/NetworkStatus.vue'

const mebibytes = (value: number): number => value * 1024 ** 2
const gibibytes = (value: number): number => value * 1024 ** 3

const memorySegments: CapacityUsageSegment[] = [
  { label: 'Used', value: mebibytes(890) },
  { label: 'Buff/Cache', value: mebibytes(460) },
  { label: 'Shared', value: mebibytes(110) },
]
</script>

<style scoped>
.dashboard-widgets-view {
  inline-size: min(100%, var(--container-xl));
  display: grid;
  gap: var(--space-xxl);

  & > section {
    min-inline-size: 0;
    display: grid;
    gap: var(--space-xl);
  }

  & :is(.status-grid, .usage-grid) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-lg);
  }

  & .usage-grid > .wide {
    grid-column: 1 / -1;
  }

  @media (width < container-token(--container-md)) {
    & :is(.status-grid, .usage-grid) {
      grid-template-columns: 1fr;
    }

    & .usage-grid > .wide {
      grid-column: auto;
    }
  }
}
</style>
