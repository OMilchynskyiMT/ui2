<template>
  <div>
    <MSpinner
      :indeterminate="false"
      :stroke-width="5"
      :value="progressValue"
      style="color: var(--blue-500)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import MSpinner from '@/components/progress/MSpinner.vue'

const progressValue = ref(0)
setInterval(() => {
  progressValue.value = Math.floor(Math.random() * 100)
}, 2000)
</script>