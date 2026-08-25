<template>
  <button
    v-ripple="{ disabled: !ripple || disabled || loading }"
    :aria-disabled="disabled || undefined"
    :class="['button', { disabled, loading }]"
    :data-tone="tone"
    :data-size="size"
    :data-variant="variant"
    :disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
    :title="title"
    :type="type"
  >
    <span class="area">
      <slot name="default">{{ label ?? '' }}</slot>
    </span>
    <span v-if="loading" class="progress">
      <MSpinner :stroke-width="5" />
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
import MSpinner from '@/lib/components/progress/MSpinner.vue'

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
    --block-size: calc(var(--font-size) * 2.5);
    --padding-inline: calc(var(--font-size) * 1.25);
    --padding-block: 0px;
    --border-width: 0px;
    --outline-width: 0px;
    --border-color: transparent;
    --border-radius: var(--input-border-radius);
    --font-size: var(--input-font-size);
    --bg: transparent;
    --bg-hover: transparent;
    --bg-active: transparent;
    --shadow: 0 0 0 transparent;
    --outline-width: 0px;
    --outline-color: transparent;
    --opacity: 1;
    --accent-color: var(--tone-color);
    --color: var(--input-text-color);

    position: relative;
    overflow: hidden;
    display: inline-block;
    cursor: pointer;
    user-select: none;

    line-height: normal;
    block-size: var(--block-size);
    padding-inline: var(--padding-inline);
    padding-block: var(--padding-block);
    border: var(--border-width) solid var(--border-color);
    color: var(--color);
    background: var(--bg);
    font-size: var(--font-size);
    border-radius: var(--border-radius);
    opacity: var(--opacity);
    box-shadow:
      var(--shadow),
      0 0 0 var(--outline-width) var(--outline-color);

    transition-property: background-color, opacity, color, border-color, box-shadow;
    transition-duration: var(--duration-md);
    transition-timing-function: var(--bezier-smooth);

    & > span.area {
      --scale: 1;
      --opacity: 1;

      block-size: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: scale(var(--scale));
      column-gap: var(--input-gap-x);
      opacity: var(--opacity);
    }

    & > span.area {
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
      pointer-events: none;

      & > span.area {
        --scale: 0.85;
        --opacity: 0;
      }
    }

    &:is([data-size='small']) {
      --font-size: var(--font-size-sm);
    }
    &:is([data-size='large']) {
      --font-size: var(--font-size-lg);
    }

    &:is([data-variant='outlined']) {
      --border-width: var(--input-border-width);
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
      --padding-inline: var(--input-gap-x);
      --padding-block: var(--input-gap-x);
      --block-size: auto;
      --color: light-dark(
        oklch(from var(--accent-color) calc(l - 0.33) c h),
        oklch(from var(--accent-color) calc(l + 0.33) c h)
      );
    }


    &:not(:disabled, .disabled, [data-variant='icon']) {
      &:not([data-variant='text']):is(:focus) {
        --outline-width: var(--input-border-width);
        --outline-color: oklch(from var(--accent-color) l c h / 0.1);
      }

      &:is(:hover, :focus) {
        --opacity: 0.9;
        --shadow: var(--shadow-sm);
      }

      &:is(:active) {
        --opacity: 1;
      }
    }

    &:is(:disabled, .disabled) {
      --opacity: 0.5;
      cursor: not-allowed;
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
