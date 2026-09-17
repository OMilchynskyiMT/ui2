<template>
  <button
    v-ripple="{ disabled: !ripple || disabled || loading }"
    :aria-busy="loading || undefined"
    :class="{ loading }"
    :data-layout="layout"
    :data-size="size"
    :data-tone="tone"
    :data-variant="variant"
    :disabled="disabled || loading"
    :title="title"
    :type="type"
    class="button"
  >
    <span class="content">
      <span v-if="icon && iconPosition === 'leading'" class="icon-frame">
        <UiIcon :icon class="button-icon" color="var(--icon-color, currentColor)" size="var(--icon-size)" />
      </span>

      <span v-if="slots.default || label !== undefined" class="label">
        <slot>{{ label ?? '' }}</slot>
      </span>

      <span v-if="icon && iconPosition === 'trailing'" class="icon-frame">
        <UiIcon :icon class="button-icon" color="var(--icon-color, currentColor)" size="var(--icon-size)" />
      </span>
    </span>

    <span v-if="loading" class="progress">
      <UiSpinner :stroke-width="4" aria-hidden="true" />
    </span>
  </button>
</template>

<script lang="ts">
import type { Component } from 'vue'

import type { ComponentTone } from '../component.types'

export type Variant = 'outlined' | 'filled' | 'text' | 'tonal'
export type Size = 'small' | 'medium' | 'large'
export type Layout = 'standard' | 'icon' | 'adaptive'
export type IconPosition = 'leading' | 'trailing'

export type Properties = {
  type?: 'button' | 'submit' | 'reset'
  variant?: Variant
  tone?: ComponentTone
  size?: Size
  layout?: Layout
  icon?: Component
  iconPosition?: IconPosition
  ripple?: boolean
  disabled?: boolean
  loading?: boolean
  label?: string
  title?: string
}
</script>

<script lang="ts" setup>
import { useSlots } from 'vue'

import UiSpinner from '../progress/UiSpinner.vue'
import UiIcon from '../UiIcon.vue'

const slots = useSlots()

const {
  tone = 'primary',
  variant = 'filled',
  size = 'medium',
  type = 'button',
  layout = 'standard',
  icon,
  iconPosition = 'leading',
  label,
  title,
  ripple = true,
  disabled = false,
  loading = false,
} = defineProps<Properties>()
</script>

<style scoped>
@layer components {
  .button {
    --button-border-width: 2px;
    --button-border-radius: var(--radius-md);
    --button-text-color: light-dark(var(--gray-900), var(--gray-100));

    --block-size: 2.25rem;
    --icon-block-size: 1.75rem;
    --icon-size: 1.125rem;
    --padding-inline: var(--space-md);
    --padding-block: 0px;
    --border-width: 0px;
    --border-color: transparent;
    --border-radius: var(--button-border-radius);
    --font-size: var(--font-size-md);
    --bg: transparent;
    --shadow: 0 0 0 transparent;
    --opacity: 1;
    --accent-color: var(--tone-color);
    --color: var(--button-text-color);
    --icon-color: currentColor;
    --gap: var(--space-sm);
    --inline-size: auto;

    position: relative;
    isolation: isolate;
    overflow: hidden;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-inline-size: 0;
    block-size: var(--block-size);
    inline-size: var(--inline-size);

    padding-inline: var(--padding-inline);
    padding-block: var(--padding-block);

    border: var(--border-width) solid var(--border-color);
    border-radius: var(--border-radius);

    color: var(--color);
    background: var(--bg);
    box-shadow: var(--shadow);

    font-size: var(--font-size);
    line-height: var(--icon-size);
    text-align: center;
    white-space: nowrap;

    cursor: pointer;
    opacity: var(--opacity);
    user-select: none;

    transition-property: background-color, border-color, box-shadow, color, opacity;
    transition-duration: var(--duration-md);
    transition-timing-function: var(--bezier-smooth);

    & > span.content {
      position: relative;
      z-index: 1;

      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--gap);

      min-inline-size: 0;
      max-inline-size: 100%;

      & > span.icon-frame {
        flex: 0 0 var(--icon-size);
        display: grid;
        place-items: center;
        inline-size: var(--icon-size);
        block-size: var(--icon-size);
      }

      & > span.label {
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    & > span.progress {
      position: absolute;
      z-index: 1;
      inset: 0;

      display: grid;
      place-items: center;

      pointer-events: none;
      animation: progress-enter var(--duration-lg) var(--bezier-bounce);

      & > svg {
        --spinner-size: var(--icon-size);
      }
    }

    &.loading {
      cursor: wait;

      & > span.content {
        opacity: 0;
      }
    }

    &[data-size='small'] {
      --block-size: 2rem;
      --icon-block-size: 1.5rem;
      --icon-size: 1rem;
      --padding-inline: 0.625rem;
      --font-size: var(--font-size-sm);
      --gap: var(--space-xs);
    }

    &[data-size='large'] {
      --block-size: 2.5rem;
      --icon-block-size: 2rem;
      --icon-size: 1.25rem;
      --padding-inline: 1rem;
      --font-size: var(--font-size-lg);
      --gap: var(--space-md);
    }

    &[data-variant='outlined'] {
      --border-width: var(--button-border-width);
      --border-color: var(--accent-color);
    }

    &[data-variant='filled'] {
      --bg: var(--accent-color);
      --color: oklch(from var(--accent-color) calc(l + 0.65) c h);
    }

    &[data-variant='text'] {
      --color: light-dark(
        oklch(from var(--accent-color) calc(l - 0.1) c h),
        oklch(from var(--accent-color) calc(l + 0.25) c h)
      );
    }

    &[data-variant='tonal'] {
      --bg: oklch(from var(--accent-color) l c h / 0.25);
      --color: light-dark(
        oklch(from var(--accent-color) calc(l - 0.15) c h),
        oklch(from var(--accent-color) calc(l + 0.33) c h)
      );
    }

    &[data-layout='icon'] {
      --block-size: var(--icon-block-size);
      --padding-inline: 0px;
      --border-radius: var(--radius-full);
      --gap: 0px;
      --inline-size: var(--block-size);

      & > span.content > span.label {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }
    }

    @media (width < container-token(--container-md)) {
      &[data-layout='adaptive'] {
        --block-size: var(--icon-block-size);
        --padding-inline: 0px;
        --border-radius: var(--radius-full);
        --gap: 0px;
        --inline-size: var(--block-size);

        & > span.content > span.label {
          position: absolute;
          inline-size: 1px;
          block-size: 1px;
          overflow: hidden;
          clip-path: inset(50%);
        }
      }
    }

    &:enabled:focus-visible {
      --shadow: inset 0 0 0 2px oklch(from var(--accent-color) l c h / 0.28);
    }

    @media (hover: hover) {
      &:enabled:hover {
        --opacity: 0.9;
      }

      &:enabled[data-layout='icon'][data-variant='text']:hover {
        --opacity: 1;
        --bg: oklch(from var(--accent-color) l c h / 0.1);
      }

      @media (width < container-token(--container-md)) {
        &:enabled[data-layout='adaptive'][data-variant='text']:hover {
          --opacity: 1;
          --bg: oklch(from var(--accent-color) l c h / 0.1);
        }
      }
    }

    &:enabled:active {
      --opacity: 1;
    }

    &:disabled:not(.loading) {
      --opacity: 0.5;
      --shadow: none;

      cursor: not-allowed;
      filter: grayscale(0.33);
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;

      & > span.progress {
        animation: none;
      }
    }
  }

  @keyframes progress-enter {
    from {
      transform: scale(1.25);
      opacity: 0;
    }

    to {
      transform: scale(1);
      opacity: 1;
    }
  }
}
</style>
