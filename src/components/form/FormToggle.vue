<template>
  <FormBinaryWrapper>
    <template #indicator>
      <span class="switch" aria-hidden="true">
        <span class="thumb" />
      </span>
    </template>
  </FormBinaryWrapper>
</template>

<script lang="ts" setup>
import FormBinaryWrapper from './FormBinary.wrapper.vue'
</script>

<style>
.form-binary {
  & > .control {
    --switch-width: 2.5rem;
    --switch-height: 1.5rem;
    --thumb-size: calc(var(--switch-height) - 0.25rem);

    & > .main {
      & > .switch {
        position: relative;
        flex: none;
        width: var(--switch-width);
        height: var(--switch-height);
        border-radius: 999px;
        opacity: var(--toggle-opacity, 1);
        background-color: var(--toggle-track-color, var(--input-border-color));
        transition:
          background-color var(--duration-md),
          box-shadow var(--duration-md);
        transition-timing-function: var(--bezier-magnetic);

        & > .thumb {
          position: absolute;
          top: 0.125rem;
          left: 0.125rem;
          width: var(--thumb-size);
          height: var(--thumb-size);
          border-radius: 50%;
          background-color: var(--toggle-thumb-color, var(--surface-bg));
          transition:
            transform var(--duration-md),
            background-color var(--duration-md);
          transition-timing-function: var(--bezier-magnetic);
        }
      }

      &:hover .switch {
        --toggle-track-color: var(--input-border-hover-color);
      }

      & > input:focus-visible + .switch {
        --toggle-track-color: var(--input-border-active-color);
        box-shadow: 0 0 0 var(--input-ring-width)
          color-mix(in srgb, var(--input-border-active-color) 20%, transparent);
      }

      & > input:checked + .switch {
        --toggle-track-color: var(--toggle-active-color, var(--input-border-active-color));

        & > .thumb {
          transform: translateX(calc(var(--switch-width) - var(--thumb-size) - 0.25rem));
        }
      }

      & > input:disabled + .switch {
        --toggle-opacity: 0.6;
        --toggle-track-color: var(--input-border-color);
      }
    }
  }

  &:has(.error) .switch {
    --toggle-track-color: var(--input-border-error-color);
  }
}
</style>
