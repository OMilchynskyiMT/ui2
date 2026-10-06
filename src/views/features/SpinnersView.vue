<template>
  <UiStack gap="var(--space-xxl)">
    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Determinate circular progress at representative component sizes">
        Circular progress
      </UiSectionHeader>

      <UiCluster align="center" gap="var(--space-xl)">
        <UiCircularProgress
          v-for="size in progressSizes"
          :key="size"
          :size="size"
          :stroke-width="5"
          :value="progressValue"
          style="color: var(--blue-500)"
        />
      </UiCluster>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Animated progress values using a heavier stroke">
        Animated circular progress
      </UiSectionHeader>

      <UiCluster align="center" gap="var(--space-xl)">
        <UiCircularProgress
          v-for="size in progressSizes"
          :key="size"
          :size="size"
          :stroke-width="10"
          :value="progress"
          style="color: var(--purple-600)"
        />
      </UiCluster>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Indeterminate spinner sizing and stroke behavior">Spinners</UiSectionHeader>

      <UiCluster align="center" gap="var(--space-xl)">
        <UiSpinner
          v-for="size in progressSizes"
          :key="size"
          :size="size"
          :stroke-width="3"
          style="color: var(--green-500)"
        />
      </UiCluster>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Default, customized, indeterminate, and segmented linear progress">
        Linear progress bars
      </UiSectionHeader>

      <UiStack class="linear-examples" gap="var(--space-xl)">
        <UiProgressBar :max="150" :value="72" style="--accent: var(--cyan-500)" />
        <UiProgressBar
          :value="90"
          style="
            --accent: linear-gradient(
              90deg,
              rgb(201, 33, 252) 0%,
              rgb(74, 126, 217) 30%,
              rgb(61, 168, 173) 50%,
              rgb(173, 166, 61) 80%
            );
            --progress-bg: #05f2;
            --height: 0.5rem;
          "
        />
        <UiProgressBar />
        <UiProgressBar :value="[28, 14, 5, 20]" style="--accent: var(--purple-500); --height: 1rem" />
      </UiStack>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Composed placeholder layout using circle, block, and text skeletons">
        Skeleton
      </UiSectionHeader>

      <UiStack class="skeleton-example" gap="var(--space-lg)">
        <UiInline gap="var(--space-md)">
          <UiSkeleton block-size="3rem" variant="circle" />
          <UiStack gap="var(--space-sm)">
            <UiSkeleton inline-size="11rem" variant="text" />
            <UiSkeleton inline-size="7rem" variant="text" />
          </UiStack>
        </UiInline>

        <UiSkeleton block-size="8rem" />

        <UiStack gap="var(--space-sm)">
          <UiSkeleton variant="text" />
          <UiSkeleton inline-size="86%" variant="text" />
          <UiSkeleton inline-size="62%" variant="text" />
        </UiStack>
      </UiStack>
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from 'vue'

import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiInline from '@/lib/components/layout/UiInline.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCircularProgress from '@/lib/components/progress/UiCircularProgress.vue'
import UiProgressBar from '@/lib/components/progress/UiProgressBar.vue'
import UiSpinner from '@/lib/components/progress/UiSpinner.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiSkeleton from '@/lib/components/status/UiSkeleton.vue'

const progressSizes = ['1rem', '1.5rem', '2rem', '2.5rem', '3rem', '4rem', '5rem']
const progress = ref(0)

const progressInterval = setInterval(() => {
  if (progress.value >= 100) {
    progress.value = 0
    return
  }

  progress.value += 1
}, 100)

const progressValue = ref(0)
const interval = setInterval(() => {
  progressValue.value = Math.floor(Math.random() * 100)
}, 2000)

onUnmounted(() => {
  clearInterval(interval)
  clearInterval(progressInterval)
})
</script>

<style scoped>
.linear-examples {
  inline-size: min(100%, var(--container-lg));
}

.skeleton-example {
  inline-size: min(100%, 36rem);
}
</style>
