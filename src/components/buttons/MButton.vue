<template>
  <button
    v-ripple="{ disabled: !ripple || disabled || loading }"
    :aria-disabled="disabled || undefined"
    :class="['button', { disabled, loading }]"
    :data-kind="kind"
    :data-size="size"
    :data-variant="variant"
    :disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
    :title="title"
    :type="type"
  >
    <div class="area">
      <slot name="default">{{ label ?? '' }}</slot>
    </div>
    <div class="progress">
      <FadeTransition appear :duration="500"><MSpinner v-if="loading" :stroke-width="5" indeterminate /></FadeTransition>
    </div>
  </button>
</template>

<script lang="ts">
export type Variant = 'outlined' | 'filled' | 'text' | 'tonal' | 'icon'
export type Kind = 'primary' | 'attention' | 'success' | 'neutral' | 'caution'
export type Size = 'small' | 'medium' | 'large'

export type Properties = {
  type?: 'button' | 'submit' | 'reset'
  variant?: Variant
  kind?: Kind
  size?: Size
  ripple?: boolean
  disabled?: boolean
  loading?: boolean
  label?: string
  title?: string
  href?: string
}
</script>

<script lang="ts" setup>
import MSpinner from '@/components/progress/MSpinner.vue'
import FadeTransition from '@/components/transitons/FadeTransition.vue'

const {
  kind = 'primary',
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
    --accent-color: transparent;
    --color: var(--input-text-color);

    position: relative;
    overflow: hidden;
    display: inline-block;
    cursor: pointer;
    user-select: none;

    block-size: var(--block-size);
    padding-inline: var(--padding-inline);
    padding-block: var(--padding-block);
    border: var(--border-width) solid var(--border-color);
    color: var(--color);
    background-color: var(--bg);
    font-size: var(--font-size);
    border-radius: var(--border-radius);
    opacity: var(--opacity);
    box-shadow:
      var(--shadow),
      0 0 0 var(--outline-width) var(--outline-color);

    transition-property: background-color, opacity, color, border-color, box-shadow;
    transition-duration: var(--duration-md);
    transition-timing-function: var(--bezier-smooth);

    & > div.area,
    & > div.progress {
      --duration: var(--duration-lg);

      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;

      transition-property: opacity, transform;
      transition-duration: var(--duration);
      transition-timing-function: var(--bezier-bounce);
    }

    & > div.area {
      transform: scale(1);
      column-gap: var(--input-gap-x);
      opacity: 1;
    }

    & > div.progress {
      transform: scale(1.25);
      position: absolute;
      inset: 0;

      & > svg {
        --spinner-size: calc(var(--font-size) * 1.5);
      }
    }

    &:is(.loading) {
      pointer-events: none;

      & > div.area {
        transform: scale(0.85);
        opacity: 0;
      }
      & > div.progress {
        transform: scale(1);
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

    &:is([data-kind='primary']) {
      --accent-color: light-dark(var(--blue-500), var(--blue-500));
    }
    &:is([data-kind='attention']) {
      --accent-color: light-dark(var(--orange-400), var(--orange-600));
    }
    &:is([data-kind='success']) {
      --accent-color: light-dark(var(--green-500), var(--green-500));
    }
    &:is([data-kind='neutral']) {
      --accent-color: light-dark(var(--gray-500), var(--gray-600));
    }
    &:is([data-kind='caution']) {
      --accent-color: light-dark(var(--red-400), var(--red-500));
    }

    &:not(:disabled, .disabled, [data-variant='icon']) {
      &:not([data-variant='text']):is(:focus) {
        --outline-width: var(--input-border-width);
        --outline-color: oklch(from var(--accent-color) l c h / 0.15);
        --shadow: var(--shadow-sm);
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
}
</style>
