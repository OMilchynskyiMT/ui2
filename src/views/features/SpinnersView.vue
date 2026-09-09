<template>
  <div class="progress-view">
    <section>
      <MSectionHeader description="Determinate circular progress at representative component sizes">
        Circular progress
      </MSectionHeader>

      <MCluster align="center" class="samples">
        <MCircularProgress
          v-for="size in progressSizes"
          :key="size"
          :size="size"
          :stroke-width="5"
          :value="progressValue"
          style="color: var(--blue-500)"
        />
      </MCluster>
    </section>

    <section>
      <MSectionHeader description="Animated progress values using a heavier stroke">
        Animated circular progress
      </MSectionHeader>

      <MCluster align="center" class="samples">
        <MCircularProgress
          v-for="size in progressSizes"
          :key="size"
          :size="size"
          :stroke-width="10"
          :value="progress"
          style="color: var(--purple-600)"
        />
      </MCluster>
    </section>

    <section>
      <MSectionHeader description="Indeterminate spinner sizing and stroke behavior">Spinners</MSectionHeader>

      <MCluster align="center" class="samples">
        <MSpinner
          v-for="size in progressSizes"
          :key="size"
          :size="size"
          :stroke-width="3"
          style="color: var(--green-500)"
        />
      </MCluster>
    </section>

    <section>
      <MSectionHeader description="Default, customized, indeterminate, and segmented linear progress">
        Linear progress bars
      </MSectionHeader>

      <div class="linear-examples">
        <MProgressBar :max="150" :value="72" style="--accent: var(--cyan-500)" />
        <MProgressBar
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
        <MProgressBar />
        <MProgressBar :value="[28, 14, 5, 20]" style="--accent: var(--purple-500); --height: 1rem" />
      </div>
    </section>

    <section>
      <MSectionHeader description="Composed placeholder layout using circle, block, and text skeletons">
        Skeleton
      </MSectionHeader>

      <div class="skeleton-example">
        <div class="skeleton-heading">
          <MSkeleton block-size="3rem" variant="circle" />
          <div class="skeleton-lines">
            <MSkeleton inline-size="11rem" variant="text" />
            <MSkeleton inline-size="7rem" variant="text" />
          </div>
        </div>

        <MSkeleton block-size="8rem" />

        <div class="skeleton-lines">
          <MSkeleton variant="text" />
          <MSkeleton inline-size="86%" variant="text" />
          <MSkeleton inline-size="62%" variant="text" />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from 'vue'

import MCluster from '@/lib/components/layout/MCluster.vue'
import MCircularProgress from '@/lib/components/progress/MCircularProgress.vue'
import MProgressBar from '@/lib/components/progress/MProgressBar.vue'
import MSpinner from '@/lib/components/progress/MSpinner.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'
import MSkeleton from '@/lib/components/status/MSkeleton.vue'

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
