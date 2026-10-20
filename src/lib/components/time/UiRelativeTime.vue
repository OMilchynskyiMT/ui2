<template>
  <time :datetime="date.toISOString()" :title="absoluteTitle">{{ relativeLabel }}</time>
</template>

<script lang="ts">
import type { DateValue } from '@/lib/format/date'

export type UiRelativeTimeProperties = {
  value: DateValue
  locale?: string
  style?: Intl.RelativeTimeFormatStyle
  numeric?: Intl.RelativeTimeFormatNumeric
  live?: boolean
}
</script>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { useRelativeClock } from '@/lib/composables/useRelativeClock'
import { toValidDate } from '@/lib/format/date'
import { formatRelativeTime } from '@/lib/format/relativeTime'

const { value, locale, style = 'long', numeric = 'auto', live = true } = defineProps<UiRelativeTimeProperties>()

const clock = useRelativeClock(computed(() => live))
const snapshot = ref(Date.now())
watch(
  () => live,
  enabled => {
    if (!enabled) snapshot.value = Date.now()
  }
)
const date = computed(() => toValidDate(value))
const relativeLabel = computed(() =>
  formatRelativeTime(date.value, { now: live ? clock.value : snapshot.value, locale, style, numeric })
)
const absoluteTitle = computed(() =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(date.value)
)
</script>
