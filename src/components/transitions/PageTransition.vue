<template>
  <div :style="{ '--page-transition-duration': `${duration}ms` }" class="page-transition">
    <Transition
      :appear="appear"
      :name="name ?? automaticName"
      enter-active-class="page-transition-enter-active"
      leave-active-class="page-transition-leave-active"
    >
      <slot />
    </Transition>
  </div>
</template>

<script lang="ts">
export type TransitionName = 'page-forward' | 'page-back' | 'page-fade' | 'page-enter'
</script>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const {
  name,
  position,
  duration = 300,
  appear = false,
} = defineProps<{
  name?: TransitionName
  position?: number
  duration?: number
  appear?: boolean
}>()

const automaticName = ref<TransitionName>(position === undefined ? 'page-forward' : 'page-enter')

watch(
  () => position,
  (next, previous) => {
    automaticName.value =
      next === undefined || next === previous || previous === undefined || next < 0 || previous < 0
        ? 'page-enter'
        : next > previous
          ? 'page-forward'
          : 'page-back'
  },
  { flush: 'sync' }
)
</script>

<style>
@layer components {
  .page-transition {
    --page-shift: 2.5rem;

    position: relative;
    display: flow-root;
    min-inline-size: 0;

    & > * {
      min-inline-size: 0;
    }

    & > .page-transition-enter-active {
      transition: opacity var(--page-transition-duration) var(--bezier-smooth-entrance);
    }

    & > .page-transition-leave-active {
      position: absolute;
      inset-block-start: 0;
      inset-inline: 0;
      z-index: 1;
      pointer-events: none;
      transition:
        opacity var(--page-transition-duration) var(--bezier-soft-exit),
        transform var(--page-transition-duration) var(--bezier-smooth);
    }

    &
      > :is(
        .page-forward-enter-from,
        .page-back-enter-from,
        .page-fade-enter-from,
        .page-enter-enter-from,
        .page-forward-leave-to,
        .page-back-leave-to,
        .page-fade-leave-to,
        .page-enter-leave-to
      ) {
      opacity: 0;
    }

    & > .page-forward-leave-to {
      transform: translateX(calc(-1 * var(--page-shift)));
    }

    & > .page-back-leave-to {
      transform: translateX(var(--page-shift));
    }

    & > .page-enter-leave-to {
      transform: translateY(calc(-1 * var(--page-shift)));
    }

    &:has(> :is(.page-forward-leave-to, .page-back-leave-to)) {
      overflow-x: clip;
      overflow-y: visible;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .page-transition {
      & > :is(.page-transition-enter-active, .page-transition-leave-active) {
        transition-duration: 0s;
        transition-delay: 0s;
      }

      & > :is(.page-forward-leave-to, .page-back-leave-to, .page-enter-leave-to) {
        transform: none;
      }
    }
  }
}
</style>
