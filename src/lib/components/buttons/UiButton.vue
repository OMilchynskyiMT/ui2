<template>
  <button
    v-ripple="{ disabled: !ripple || disabled || loading }"
    :aria-busy="loading || undefined"
    :aria-disabled="disabled || loading || undefined"
    :class="['button', { disabled, loading }]"
    :data-size="size"
    :data-tone="tone"
    :data-variant="variant"
    :disabled="disabled || loading || undefined"
    :tabindex="disabled || loading ? -1 : undefined"
    :title="title"
    :type="type"
  >
    <span class="area">
      <slot name="default">{{ label ?? '' }}</slot>
    </span>
    <span v-if="loading" class="progress">
      <UiSpinner :stroke-width="4" />
    </span>
  </button>
</template>

<script lang="ts">
import type { ComponentTone } from '../component.types'

export type Variant = 'outlined' | 'filled' | 'text' | 'tonal' | 'icon'
export type Size = 'small' | 'medium' | 'large'

export type Properties = {
  type?: 'button' | 'submit' | 'reset'
  variant?: Variant
  tone?: ComponentTone
  size?: Size
  ripple?: boolean
  disabled?: boolean
  loading?: boolean
  label?: string
  title?: string
}
</script>

<script lang="ts" setup>
import UiSpinner from '@/lib/components/progress/UiSpinner.vue'

const {
  tone = 'primary',
  variant = 'filled',
  size = 'medium',
  type = 'button',
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
    --button-gap: var(--space-sm);
    --button-text-color: light-dark(var(--gray-900), var(--gray-100));

    --block-size: 2.25rem;
    --icon-block-size: 1.75rem;
    --padding-inline: 0.875rem;
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

    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: 0;
    block-size: var(--block-size);
    padding-inline: var(--padding-inline);
    padding-block: var(--padding-block);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--color);
    background: var(--bg);
    box-shadow: var(--shadow);
    font-size: var(--font-size);
    line-height: var(--line-height-compact);
    cursor: pointer;
    opacity: var(--opacity);
    user-select: none;
    vertical-align: middle;

    transition-property: background-color, opacity, color, border-color, box-shadow;
    transition-duration: var(--duration-md);
    transition-timing-function: var(--bezier-smooth);

    & > span.area {
      --scale: 1;
      --opacity: 1;

      min-inline-size: 0;
      block-size: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      column-gap: var(--button-gap);
      opacity: var(--opacity);
      transform: scale(var(--scale));
      transition-property: opacity, transform;
      transition-duration: var(--duration-lg);
      transition-timing-function: var(--bezier-bounce);
    }

    & > span.progress {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      pointer-events: none;
      animation: progress-enter var(--duration-lg) var(--bezier-bounce);

      & > svg {
        --spinner-size: calc(var(--font-size) * 1.5);
      }
    }

    &:is(.loading) {
      --opacity: 1;
      pointer-events: none;
      cursor: wait;

      & > span.area {
        --scale: 0.85;
        --opacity: 0;
      }
    }

    &:is([data-size='small']) {
      --block-size: 2rem;
      --icon-block-size: 1.5rem;
      --padding-inline: 0.625rem;
      --font-size: var(--font-size-sm);
    }

    &:is([data-size='large']) {
      --block-size: 2.5rem;
      --icon-block-size: 2rem;
      --padding-inline: 1rem;
      --font-size: var(--font-size-lg);
    }

    &:is([data-variant='outlined']) {
      --border-width: var(--button-border-width);
      --border-color: var(--accent-color);
    }

    &:is([data-variant='filled']) {
      --bg: var(--accent-color);
      --color: oklch(from var(--accent-color) calc(l + 0.65) c h);
    }

    &:is([data-variant='text']) {
      --color: light-dark(
        oklch(from var(--accent-color) calc(l - 0.15) c h),
        oklch(from var(--accent-color) calc(l + 0.25) c h)
      );
    }

    &:is([data-variant='tonal']) {
      --bg: oklch(from var(--accent-color) l c h / 0.25);
      --color: light-dark(
        oklch(from var(--accent-color) calc(l - 0.15) c h),
        oklch(from var(--accent-color) calc(l + 0.33) c h)
      );
    }

    &:is([data-variant='icon']) {
      --block-size: var(--icon-block-size);
      --padding-inline: 0px;
      --padding-block: 0px;
      --border-radius: var(--radius-full);
      --color: light-dark(
        oklch(from var(--accent-color) calc(l - 0.33) c h),
        oklch(from var(--accent-color) calc(l + 0.33) c h)
      );

      inline-size: var(--block-size);
      flex: 0 0 auto;
    }

    &:where(:not(:disabled, .disabled, .loading)):focus-visible {
      --shadow: inset 0 0 0 2px oklch(from var(--accent-color) l c h / 0.28);
    }

    @media (hover: hover) {
      &:where(:not(:disabled, .disabled, .loading)):hover {
        --opacity: 0.9;
      }

      &:where(:not(:disabled, .disabled, .loading))[data-variant='icon']:hover {
        --opacity: 1;
        --bg: oklch(from var(--accent-color) l c h / 0.1);
      }
    }

    &:where(:not(:disabled, .disabled, .loading)):active {
      --opacity: 1;
    }

    &:is(:disabled, .disabled):not(.loading) {
      --opacity: 0.5;
      --shadow: none;
      cursor: not-allowed;
      filter: grayscale(0.33);
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
