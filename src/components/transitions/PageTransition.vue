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
    --page-shift: var(--space-xxl);

    position: relative;
    display: grid;
    overflow: visible;

    & > * {
      --page-offset-x: 0px;
      --page-offset-y: 0px;
      --opacity: 1;

      grid-area: 1 / 1;
      min-inline-size: 0;
      align-self: start;
      opacity: var(--opacity);
      transform: translate3d(var(--page-offset-x), var(--page-offset-y), 0);
    }

    &:has(
      > :is(.page-forward-enter-active, .page-forward-leave-active, .page-back-enter-active, .page-back-leave-active)
    ) {
      overflow-x: clip;
      overflow-y: visible;
    }

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
    }

    &
      > :is(
        .page-forward-enter-from,
        .page-back-leave-to,
        .page-forward-leave-to,
        .page-back-enter-from,
        .page-fade-enter-from,
        .page-fade-leave-to,
        .page-enter-enter-from,
        .page-enter-leave-to
      ) {
      --opacity: 0;
    }

    & > :is(.page-forward-enter-from, .page-back-leave-to) {
      --page-offset-x: var(--page-shift);
      --page-offset-y: 0px;
    }

    & > :is(.page-forward-leave-to, .page-back-enter-from) {
      --page-offset-x: calc(-1 * var(--page-shift));
      --page-offset-y: 0px;
    }

    & > :is(.page-enter-enter-from, .page-enter-leave-to) {
      --page-offset-x: 0px;
      --page-offset-y: var(--page-shift);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .m-page-transition {
      --page-shift: 0px;
      --page-transition-duration: 1ms;
    }
  }
}
</style>
