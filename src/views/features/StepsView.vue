<template>
  <UiStack gap="var(--space-xxl)">
    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Controlled progress indication, optional steps, and guarded navigation requests">
        Interactive steps
      </UiSectionHeader>

      <UiCard>
        <UiStack gap="var(--space-xl)">
          <UiSteps :current="current" :steps="setupSteps" interactive @select="selectStep" />

          <UiStack gap="var(--space-xs)">
            <strong>{{ activeStep?.title }}</strong>
            <span>{{ activeStep?.description }}</span>
          </UiStack>

          <UiCluster gap="var(--space-lg)">
            <UiCheckbox v-model="cellularEnabled" label="Device has a cellular modem" />
            <UiCheckbox v-model="timeHasError" label="Show time configuration error" />
          </UiCluster>

          <UiCluster justify="between">
            <UiButton :disabled="currentIndex === 0" variant="outlined" @click="move(-1)">Previous</UiButton>
            <UiButton :disabled="currentIndex === setupSteps.length - 1" @click="move(1)">Next</UiButton>
          </UiCluster>
        </UiStack>
      </UiCard>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Passive status presentation independent of wizard controls">
        Operation progress
      </UiSectionHeader>
      <UiCard>
        <UiSteps :current="'verify'" :steps="operationSteps" aria-label="Firmware operation progress" />
      </UiCard>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="The same component adapts to its container, not the browser's width">
        Constrained container
      </UiSectionHeader>
      <UiCard>
        <div class="narrow-steps">
          <UiSteps :current="'time'" :steps="setupSteps" aria-label="Narrow step example" />
        </div>
      </UiCard>
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiCheckbox from '@/lib/components/fields/UiCheckbox.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import type { UiStep } from '@/lib/components/steps/steps.shared'
import UiSteps from '@/lib/components/steps/UiSteps.vue'

const current = ref('time')
const cellularEnabled = ref(true)
const timeHasError = ref(false)

const setupSteps = computed<readonly UiStep[]>(() => [
  { value: 'welcome', title: 'Welcome', description: 'Introduction' },
  { value: 'time', title: 'Time', description: 'Clock and timezone', status: timeHasError.value ? 'error' : undefined },
  ...(cellularEnabled.value
    ? [{ value: 'cellular', title: 'Cellular', description: 'Network registration', optional: true }]
    : []),
  { value: 'review', title: 'Review', description: 'Confirm device settings' },
])

const currentIndex = computed(() => setupSteps.value.findIndex(step => step.value === current.value))
const activeStep = computed(() => setupSteps.value[currentIndex.value])

watch(cellularEnabled, enabled => {
  if (!enabled && current.value === 'cellular') current.value = 'review'
})

const selectStep = (step: UiStep): void => {
  // A real wizard can validate the current form before accepting this request.
  current.value = step.value
}

const move = (offset: number): void => {
  const next = setupSteps.value[currentIndex.value + offset]
  if (next) selectStep(next)
}

const operationSteps: readonly UiStep[] = [
  { value: 'upload', title: 'Upload', description: 'Transfer package', status: 'complete' },
  { value: 'verify', title: 'Verification', description: 'Device validation', status: 'error' },
  { value: 'install', title: 'Installation', description: 'Not started yet' },
  { value: 'reboot', title: 'Restart', description: 'Awaiting installation' },
]
</script>

<style scoped>
.narrow-steps {
  max-inline-size: var(--container-sm);
}
</style>
