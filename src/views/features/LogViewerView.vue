<template>
  <UiStack gap="var(--space-xl)">
    <UiSectionHeader description="Reactive text input, line wrapping, literal search, full-log export, and follow-tail">
      Log viewer
      <template #actions>
        <UiButton :icon="PlusIcon" size="small" tone="neutral" variant="tonal" @click="appendEntry">
          Append entry
        </UiButton>
        <UiButton :icon="RotateCcwIcon" size="small" tone="neutral" variant="tonal" @click="restart">
          Reboot demo
        </UiButton>
        <UiButton
          :icon="streaming ? PauseIcon : PlayIcon"
          size="small"
          tone="primary"
          variant="tonal"
          @click="streaming = !streaming"
        >
          {{ streaming ? 'Pause stream' : 'Resume stream' }}
        </UiButton>
      </template>
    </UiSectionHeader>

    <UiLogViewer
      v-model:follow="following"
      v-model:wrap="wrapped"
      :text="log"
      expandable
      filename="device-system.log"
    />

    <p class="hint">
      Scroll upward to stop following new lines; return to the bottom or select Follow latest to resume. Search
      navigates through literal matches without filtering the log. Copy and download preserve the complete source text.
    </p>
  </UiStack>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { PauseIcon, PlayIcon, PlusIcon, RotateCcwIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiLogViewer from '@/lib/components/log/UiLogViewer.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'

const log = ref('')
const streaming = ref(true)
const following = ref(true)
const wrapped = ref(false)
let sequence = 0
let interval: ReturnType<typeof setInterval> | undefined
let bootTimer: ReturnType<typeof setTimeout> | undefined

const appendEntry = (): void => {
  sequence++
  const status = sequence % 5 === 0 ? 'WARN' : 'INFO'
  log.value += `${new Date().toLocaleTimeString()} ${status} service: health check ${sequence} completed\n`
}

const restart = (): void => {
  if (bootTimer) clearTimeout(bootTimer)
  log.value = ''
  following.value = true
  sequence = 0

  bootTimer = setTimeout(() => {
    Array.from({ length: 20 }, () => appendEntry())
    bootTimer = undefined
  }, 550)
}

onMounted(() => {
  restart()
  interval = setInterval(() => {
    if (streaming.value && log.value) appendEntry()
  }, 1800)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  if (bootTimer) clearTimeout(bootTimer)
})
</script>

<style scoped>
.hint {
  color: var(--text-color-dimmed);
  font-size: var(--font-size-sm);
}
</style>
