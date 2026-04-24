<template>
  <form-binary-wrapper type="radio" variant="radio">
    <template #indicator>
      <span class="dot" />
    </template>

    <template v-if="$slots.before" #before><slot name="before" /></template>
    <slot />
    <template v-if="$slots.after" #after><slot name="after" /></template>
  </form-binary-wrapper>
</template>

<script lang="ts" setup>
import FormBinaryWrapper from '@/components/form/form-binary.wrapper.vue'
</script>

<style>
.form-binary[data-variant='radio'] {
  & > .control {
    --size: 1.25rem;
    --dot-size: calc(var(--size) * 0.5);

    & > .main {
      & > .indicator {
        width: var(--size);
        height: var(--size);
        border: var(--input-border-width) solid var(--radio-border-color, var(--input-border-color));
        border-radius: 50%;
        background-color: var(--radio-bg, var(--surface-bg));
        opacity: var(--radio-opacity, 1);

        & > .dot {
          width: var(--dot-size);
          height: var(--dot-size);
          border-radius: 50%;
          background-color: var(--radio-dot-color, var(--input-border-active-color));
          transform: var(--radio-dot-transform, scale(0.5));
          opacity: var(--radio-dot-opacity, 0);
          will-change: transform, opacity, background-color;
          transition:
            opacity var(--duration-sm),
            transform var(--duration-md),
            background-color var(--duration-md);
          transition-timing-function: var(--bezier-magnetic);
        }
      }

      &:hover > .indicator {
        --radio-border-color: var(--input-border-hover-color);
      }

      & > input:focus-visible + .indicator {
        --radio-border-color: var(--input-border-active-color);
      }

      & > input:checked + .indicator {
        --radio-border-color: var(--radio-active-color, var(--input-border-active-color));
      }

      & > input:checked + .indicator > .dot {
        --radio-dot-opacity: 1;
        --radio-dot-transform: scale(1);
      }

      & > input:disabled + .indicator {
        --radio-opacity: 0.6;
        --radio-border-color: var(--input-border-color);
      }
    }
  }

  &.has-error .indicator {
    --radio-border-color: var(--input-border-error-color);
  }
}
</style>