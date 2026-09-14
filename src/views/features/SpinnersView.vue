<template>
  <div class="progress-view">
    <section>
      <UiSectionHeader description="Determinate circular progress at representative component sizes">
        Circular progress
      </UiSectionHeader>

      <UiCluster align="center" class="samples">
        <UiCircularProgress
          v-for="size in progressSizes"
          :key="size"
          :size="size"
          :stroke-width="5"
          :value="progressValue"
          style="color: var(--blue-500)"
        />
      </UiCluster>
    </section>

    <section>
      <UiSectionHeader description="Animated progress values using a heavier stroke">
        Animated circular progress
      </UiSectionHeader>

      <UiCluster align="center" class="samples">
        <UiCircularProgress
          v-for="size in progressSizes"
          :key="size"
          :size="size"
          :stroke-width="10"
          :value="progress"
          style="color: var(--purple-600)"
        />
      </UiCluster>
    </section>

    <section>
      <UiSectionHeader description="Indeterminate spinner sizing and stroke behavior">Spinners</UiSectionHeader>

      <UiCluster align="center" class="samples">
        <UiSpinner
          v-for="size in progressSizes"
          :key="size"
          :size="size"
          :stroke-width="3"
          style="color: var(--green-500)"
        />
      </UiCluster>
    </section>

    <section>
      <UiSectionHeader description="Default, customized, indeterminate, and segmented linear progress">
        Linear progress bars
      </UiSectionHeader>

      <div class="linear-examples">
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
      </div>
    </section>

    <section>
      <UiSectionHeader description="Composed placeholder layout using circle, block, and text skeletons">
        Skeleton
      </UiSectionHeader>

      <div class="skeleton-example">
        <div class="skeleton-heading">
          <UiSkeleton block-size="3rem" variant="circle" />
          <div class="skeleton-lines">
            <UiSkeleton inline-size="11rem" variant="text" />
            <UiSkeleton inline-size="7rem" variant="text" />
          </div>
        </div>

        <UiSkeleton block-size="8rem" />

        <div class="skeleton-lines">
          <UiSkeleton variant="text" />
          <UiSkeleton inline-size="86%" variant="text" />
          <UiSkeleton inline-size="62%" variant="text" />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from 'vue'

import UiCluster from '@/lib/components/layout/UiCluster.vue'
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
.progress-view {
  min-inline-size: 0;
  display: grid;
  gap: var(--space-xxl);

  & > section {
    min-inline-size: 0;
    display: grid;
    gap: var(--space-xl);
  }

  & .samples {
    --cluster-gap: var(--space-xl);
  }
}

.linear-examples,
.skeleton-example,
.skeleton-lines {
  display: grid;
}

.linear-examples {
  gap: var(--space-xl);
  inline-size: min(100%, var(--container-lg));
}

.skeleton-example {
  gap: var(--space-lg);
  inline-size: min(100%, 36rem);
}

.skeleton-heading {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--space-md);
}

.skeleton-lines {
  gap: var(--space-sm);
}
</style>
