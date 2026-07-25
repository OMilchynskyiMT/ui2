<template>
  <div :style="{ '--page-transition-duration': `${duration}ms` }" class="m-page-transition">
    <Transition :appear="appear" :duration="duration" :name="name">
      <slot />
    </Transition>
  </div>
</template>

<script lang="ts">
export type TransitionName = 'page-forward' | 'page-back' | 'page-fade' | 'page-enter'
</script>

<script lang="ts" setup>
const {
  name = 'page-forward',
  duration = 260,
  appear = false,
} = defineProps<{
  name?: TransitionName
  duration?: number
  appear?: boolean
}>()
</script>

<style>
@layer components {
  .m-page-transition {
    --page-shift: 3rem;

    position: relative;
    overflow: clip;

    &
      > :is(
        .page-forward-enter-active,
        .page-forward-leave-active,
        .page-back-enter-active,
        .page-back-leave-active,
        .page-fade-enter-active,
        .page-fade-leave-active,
        .page-enter-enter-active,
        .page-enter-leave-active
      ) {
      transition-property: transform, opacity;
      transition-duration: var(--page-transition-duration);
      transition-timing-function: var(--bezier-smooth);
      will-change: transform, opacity;
    }

    & > :is(.page-forward-enter-from, .page-back-leave-to) {
      opacity: 0;
      transform: translateX(var(--page-shift));
    }

    & > :is(.page-forward-leave-to, .page-back-enter-from) {
      opacity: 0;
      transform: translateX(calc(-1 * var(--page-shift)));
    }

    & > :is(.page-fade-enter-from, .page-fade-leave-to) {
      opacity: 0;
    }

    & > .page-enter-enter-from {
      opacity: 0;
      transform: translateY(calc(var(--page-shift) * 0.25));
    }

    & > .page-enter-leave-to {
      opacity: 0;
      transform: translateY(calc(var(--page-shift) * -0.25));
    }

    & > :is(.page-forward-leave-active, .page-back-leave-active) {
      position: absolute;
      inset: 0;
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .m-page-transition {
      --page-transition-duration: 1ms;
    }

    .page-forward-enter-from,
    .page-forward-leave-to,
    .page-back-enter-from,
    .page-back-leave-to,
    .page-enter-enter-from,
    .page-enter-leave-to {
      transform: none;
    }
  }
}
</style>