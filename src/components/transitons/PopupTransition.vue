<template>
  <Transition :appear="appear" :duration="duration" :name="name">
    <slot />
  </Transition>
</template>

<script lang="ts">
export type TransitionName = 'fade-y'
</script>

<script lang="ts" setup>
const {
  name = 'fade-y',
  duration = 160,
  appear = false,
} = defineProps<{
  name?: TransitionName
  duration?: number
  appear?: boolean
}>()

const cssDuration = `${duration}ms`
</script>

<style scoped>
.fade-y-enter-active,
.fade-y-leave-active {
  will-change: transform, opacity;
  transition-property: transform, opacity;
  transition-duration: v-bind(cssDuration);
}

.fade-y-enter-active {
  transition-timing-function: var(--bezier-smooth-entrance);
}

.fade-y-leave-active {
  transition-timing-function: var(--bezier-soft-exit);
}

.fade-y-enter-from,
.fade-y-leave-to {
  opacity: 0;
  transform: translateY(var(--popup-translate-y, 0));
}

.fade-y-enter-to,
.fade-y-leave-from {
  opacity: 1;
  transform: translateY(0);
}

:is(.fade-y-enter-from, .fade-y-leave-to):is([data-placement='top-start'], [data-placement='top-end']) {
  --popup-translate-y: 0.5rem;
}

:is(.fade-y-enter-from, .fade-y-leave-to):is([data-placement='bottom-start'], [data-placement='bottom-end']) {
  --popup-translate-y: -0.5rem;
}

@media (prefers-reduced-motion: reduce) {
  .fade-y-enter-active,
  .fade-y-leave-active {
    transition: none;
  }

  .fade-y-enter-from,
  .fade-y-leave-to {
    transform: none;
  }
}
</style>
