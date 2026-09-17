<template>
  <button
    v-ripple="{ disabled: !ripple || disabled || loading }"
    :aria-busy="loading || undefined"
    :aria-disabled="disabled || loading || undefined"
    :class="['button', { disabled, loading }]"
    :data-layout="layout"
    :data-size="size"
    :data-tone="tone"
    :data-variant="variant"
    :disabled="disabled || loading || undefined"
    :tabindex="disabled || loading ? -1 : undefined"
    :title="title"
    :type="type"
  >
    <span v-if="slots.leading" class="leading">
      <slot name="leading" />
    </span>
    <span v-if="slots.default ?? label" class="label">
      <slot name="default">{{ label ?? '' }}</slot>
    </span>
    <span v-if="slots.trailing" class="trailing">
      <slot name="trailing" />
    </span>

    <span v-if="loading" class="progress">
      <UiSpinner :stroke-width="4" />
    </span>
  </button>
</template>

<script lang="ts">
import type { ComponentTone } from '../component.types'

export type Variant = 'outlined' | 'filled' | 'text' | 'tonal'
export type Size = 'small' | 'medium' | 'large'
export type Layout = 'standard' | 'icon' | 'adaptive'

export type Properties = {
  type?: 'button' | 'submit' | 'reset'
  variant?: Variant
  tone?: ComponentTone
  size?: Size
  layout?: Layout
  ripple?: boolean
  disabled?: boolean
  loading?: boolean
  label?: string
  title?: string
}
</script>

<script lang="ts" setup>
import { useSlots } from 'vue'

import UiSpinner from '@/lib/components/progress/UiSpinner.vue'

const slots = useSlots()
const {
  tone = 'primary',
  variant = 'filled',
  size = 'medium',
  type = 'button',
  layout = 'standard',
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
    --gap: var(--space-sm);

    --label-display: block;
    --inline-size: auto;

    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap);
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
    cursor: pointer;
    opacity: var(--opacity);
    user-select: none;

    transition-property: background-color, opacity, color, border-color, box-shadow;
    transition-duration: var(--duration-md);
    transition-timing-function: var(--bezier-smooth);

    & > :is(span.trailing, span.label) {
      display: var(--label-display);
    }

    & > :is(span.leading) {
      display: flex;
    }

    & > :is(span.leading, span.trailing, span.label) {
      --scale: 1;
      --opacity: 1;

      opacity: var(--opacity);
      transform: scale(var(--scale));
      transition-property: opacity, transform;
      transition-duration: var(--duration-lg);
      transition-timing-function: var(--bezier-bounce);
    }

    & > span.label {
      min-inline-size: 0;
      line-height: var(--line-height);
      text-box: trim-both cap alphabetic;
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

      & > :is(span.label, span.leading, span.trailing) {
        --scale: 0.85;
        --opacity: 0;
      }
    }

    &:is([data-size='small']) {
      --block-size: 2rem;
      --icon-block-size: 1.5rem;
      --padding-inline: 0.625rem;
      --font-size: var(--font-size-sm);
      --gap: var(--space-xs);
    }

    &:is([data-size='large']) {
      --block-size: 2.5rem;
      --icon-block-size: 2rem;
      --padding-inline: 1rem;
      --font-size: var(--font-size-lg);
      --gap: var(--space-md);
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
        oklch(from var(--accent-color) calc(l - 0.1) c h),
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

    &:is([data-layout='icon']) {
      --padding-inline: 0px;
      --padding-block: 0px;
      --block-size: var(--icon-block-size);
      --border-radius: var(--radius-full);
      --label-display: none;
      --inline-size: var(--block-size);
    }

    @media (width < container-token(--container-md)) {
      &:is([data-layout='adaptive']) {
        --padding-inline: 0px;
        --padding-block: 0px;
        --block-size: var(--icon-block-size);
        --border-radius: var(--radius-full);
        --label-display: none;
        --inline-size: var(--block-size);
      }
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
