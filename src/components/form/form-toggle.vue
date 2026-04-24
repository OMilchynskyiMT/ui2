<template>
  <form-binary-wrapper type="checkbox" variant="toggle">
    <template #indicator>
      <span class="thumb" />
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
.form-binary[data-variant='toggle'] {
  & > .control {
    --switch-width: 2.5rem;
    --switch-height: 1.5rem;
    --thumb-size: calc(var(--switch-height) - 0.25rem);

    & > .main {
      & > .indicator {
        width: var(--switch-width);
        height: var(--switch-height);
        border-radius: 999px;
        opacity: var(--toggle-opacity, 1);
        background-color: var(--toggle-track-color, var(--input-border-color));

        & > .thumb {
          position: absolute;
          top: 0.125rem;
          left: 0.125rem;
          width: var(--thumb-size);
          height: var(--thumb-size);
          border-radius: 50%;
          background-color: var(--toggle-thumb-color, var(--surface-bg));
          will-change: transform, background-color;
          transition:
            transform var(--duration-md),
            background-color var(--duration-md);
          transition-timing-function: var(--bezier-magnetic);
        }
      }

      &:hover > .indicator {
        --toggle-track-color: var(--input-border-hover-color);
      }

      & > input:focus-visible + .indicator {
        --toggle-track-color: var(--input-border-active-color);
      }

      & > input:checked + .indicator {
        --toggle-track-color: var(--toggle-active-color, var(--input-border-active-color));

        & > .thumb {
          transform: translateX(calc(var(--switch-width) - var(--thumb-size) - 0.25rem));
        }
      }

      & > input:disabled + .indicator {
        --toggle-opacity: 0.6;
        --toggle-track-color: var(--input-border-color);
      }
    }
  }

  &.has-error .indicator {
    --toggle-track-color: var(--input-border-error-color);
  }
}
</style>