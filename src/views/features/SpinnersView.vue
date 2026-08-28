<template>
  <div style="display: grid; gap: 2rem">
    <h2>Circular progress & spinner</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr))">
      <MCircularProgress
        v-for="size in ['1rem', '1.5rem', '2rem', '2.5rem', '3rem', '4rem', '5rem']"
        :key="size"
        :size="size"
        :stroke-width="5"
        :value="progressValue"
        style="color: var(--blue-500)"
      />
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr))">
      <MCircularProgress
        v-for="size in ['1rem', '1.5rem', '2rem', '2.5rem', '3rem', '4rem', '5rem']"
        :key="size"
        :size="size"
        :stroke-width="10"
        :value="progress"
        style="color: var(--purple-600)"
      />
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr))">
      <MSpinner
        v-for="size in ['1rem', '1.5rem', '2rem', '2.5rem', '3rem', '4rem', '5rem']"
        :key="size"
        :size="size"
        :stroke-width="3"
        style="color: var(--green-500)"
      />
    </div>

    <h2>Linear progress bars</h2>
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

    <h2>Skeleton</h2>
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
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from 'vue'

import MCircularProgress from '@/lib/components/progress/MCircularProgress.vue'
import MProgressBar from '@/lib/components/progress/MProgressBar.vue'
import MSpinner from '@/lib/components/progress/MSpinner.vue'
import MSkeleton from '@/lib/components/status/MSkeleton.vue'

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
.skeleton-example {
  display: grid;
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
  display: grid;
  gap: var(--space-sm);
}
</style>
