<template>
  <UiStack gap="var(--space-xxl)">
    <UiStack gap="var(--space-lg)" tag="section">
      <UiSectionHeader description="Live, locale-aware relative timestamps; one shared clock across all instances">
        Relative time
      </UiSectionHeader>
      <UiCard>
        <UiStack gap="var(--space-md)">
          <UiCluster>
            <UiButton :variant="locale === 'en' ? 'tonal' : 'outlined'" @click="locale = 'en'">English</UiButton>
            <UiButton :variant="locale === 'ru' ? 'tonal' : 'outlined'" @click="locale = 'ru'">Русский</UiButton>
            <UiButton :variant="locale === 'uk' ? 'tonal' : 'outlined'" @click="locale = 'uk'">Українська</UiButton>
          </UiCluster>
          <UiPropertyList :data="examples" :items="relativeItems">
            <template #value="{ value }">
              <UiRelativeTime :locale :value="value" />
            </template>
          </UiPropertyList>
        </UiStack>
      </UiCard>
    </UiStack>

    <UiStack gap="var(--space-lg)" tag="section">
      <UiSectionHeader description="Elapsed durations are fixed time quantities, not calendar months or years">
        Durations
      </UiSectionHeader>
      <UiCard>
        <UiStack gap="var(--space-md)">
          <UiCluster>
            <UiButton :variant="durationStyle === 'compact' ? 'tonal' : 'outlined'" @click="durationStyle = 'compact'">
              Compact
            </UiButton>
            <UiButton :variant="durationStyle === 'long' ? 'tonal' : 'outlined'" @click="durationStyle = 'long'">
              Long
            </UiButton>
          </UiCluster>
          <UiPropertyList :data="durations" :format-value="formatDemoDuration" :items="durationItems" />
        </UiStack>
      </UiCard>
    </UiStack>

    <UiStack gap="var(--space-lg)" tag="section">
      <UiSectionHeader description="Device API date/time and native browser date inputs use local calendar fields">
        Local date formats
      </UiSectionHeader>
      <UiCard>
        <UiPropertyList :data="localDateExamples" :items="dateItems" />
      </UiCard>
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiPropertyList, { type Item } from '@/lib/components/list/UiPropertyList.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiRelativeTime from '@/lib/components/time/UiRelativeTime.vue'
import { formatLocalDateInput } from '@/lib/format/date'
import { type DurationFormatOptions, formatDuration } from '@/lib/format/duration'
import { formatDeviceDateTime } from '@/models/device/formatDeviceDateTime'

const locale = ref('en')
const durationStyle = ref<DurationFormatOptions['style']>('compact')
const now = Date.now()
const examples = {
  recent: new Date(now - 35_000),
  minutesAgo: new Date(now - 5 * 60_000),
  yesterday: new Date(now - 86_400_000),
  lastWeek: new Date(now - 7 * 86_400_000),
  future: new Date(now + 3 * 3_600_000),
}
const relativeItems = [
  { field: 'recent', label: 'Just happened' },
  { field: 'minutesAgo', label: 'Recently' },
  { field: 'yesterday', label: 'Previous day' },
  { field: 'lastWeek', label: 'Previous week' },
  { field: 'future', label: 'Upcoming' },
] satisfies readonly Item<typeof examples>[]

const durations = { zero: 0, seconds: 42_000, uptime: 93_605_000, licensePeriod: 40 * 86_400_000 }
const durationItems = [
  { field: 'zero', label: 'Zero' },
  { field: 'seconds', label: 'Seconds' },
  { field: 'uptime', label: 'Uptime' },
  { field: 'licensePeriod', label: 'License evaluation period' },
] satisfies readonly Item<typeof durations>[]
const formatDemoDuration = (value: number): string =>
  formatDuration(value, { style: durationStyle.value, locale: locale.value })

const exampleDate = new Date(2026, 9, 19, 14, 5, 6)
const localDateExamples = {
  browserInput: formatLocalDateInput(exampleDate),
  deviceApi: formatDeviceDateTime(exampleDate),
}
const dateItems = [
  { field: 'browserInput', label: 'Native date input' },
  { field: 'deviceApi', label: 'Legacy device API' },
] satisfies readonly Item<typeof localDateExamples>[]
</script>
