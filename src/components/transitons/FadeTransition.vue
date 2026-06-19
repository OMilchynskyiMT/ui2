<template>
  <Transition :appear="appear" :duration="duration" :name="name">
    <slot />
  </Transition>
</template>

<script lang="ts">
export type TransitionName = 'fade'
</script>

<script lang="ts" setup>
const {
  name = 'fade',
  duration = 160,
  appear = false
} = defineProps<{
  name?: TransitionName
  duration?: number,
  appear?: boolean
}>()

const cssDuration = `${duration}ms`
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  will-change: opacity;
  transition-property: opacity;
  transition-duration: var(--duration, v-bind(cssDuration));
  transition-timing-function: var(--bezier-smooth);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>