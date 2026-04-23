<template>
  <FormBinaryWrapper type="checkbox" variant="checkbox">
    <template #indicator>
      <svg viewBox="0 0 16 16">
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
      </svg>
    </template>

    <template v-if="$slots.before" #before><slot name="before" /></template>
    <slot />
    <template v-if="$slots.after" #after><slot name="after" /></template>
  </FormBinaryWrapper>
</template>

<script lang="ts" setup>
import FormBinaryWrapper from '@/components/form/FormBinary.wrapper.vue'
</script>

<style>
.form-binary[data-variant='checkbox'] {
  & > .control {
    --size: 1.25rem;

    & > .main {
      & > .indicator {
        width: var(--size);
        height: var(--size);
        border: var(--input-border-width) solid var(--checkbox-border-color, var(--input-border-color));
        border-radius: calc(var(--input-border-radius) / 2);
        background-color: var(--checkbox-bg, var(--surface-bg));
        opacity: var(--checkbox-opacity, 1);

        & > svg {
          width: calc(var(--size) * 0.7);
          height: calc(var(--size) * 0.7);
          transform: var(--checkbox-transform, scale(0.75) translateY(calc(-0.25 * var(--size))));
          opacity: var(--indicator-opacity, 0);
          transition:
            opacity var(--duration-sm),
            transform var(--duration-md);
          transition-timing-function: var(--bezier-magnetic);

          & > path {
            fill: none;
            stroke: var(--checkbox-icon-color, white);
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
        }
      }

      &:hover > .indicator {
        --checkbox-border-color: var(--input-border-hover-color);
      }

      & > input:focus-visible + .indicator {
        --checkbox-border-color: var(--input-border-active-color);
      }

      & > input:checked + .indicator {
        --checkbox-border-color: var(--checkbox-active-color, var(--input-border-active-color));
        --checkbox-bg: var(--checkbox-active-color, var(--input-border-active-color));
      }

      & > input:checked + .indicator > svg {
        --indicator-opacity: 1;
        --checkbox-transform: scale(1.25) translateY(0);
      }

      & > input:disabled + .indicator {
        --checkbox-opacity: 0.6;
        --checkbox-border-color: var(--input-border-color);
      }
    }
  }

  &.has-error .indicator {
    --checkbox-border-color: var(--input-border-error-color);
  }
}
</style>
