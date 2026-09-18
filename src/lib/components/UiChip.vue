<template>
  <span :data-size="size" :data-tone="tone" :data-variant="variant" :title="title" class="chip">
    <span v-if="slots.leading" class="leading"><slot name="leading" /></span>
    <span class="main">
      <span class="label">
        <slot name="default">{{ label ?? '' }}</slot>
      </span>
    </span>
    <span v-if="slots.trailing" class="trailing"><slot name="trailing" /></span>
  </span>
</template>

<script lang="ts">
import type { ComponentTone } from './component.types'

export type Variant = 'outlined' | 'filled' | 'tonal' | 'text'
export type Size = 'small' | 'medium' | 'large'

export type Properties = {
  variant?: Variant
  tone?: ComponentTone
  size?: Size
  label?: string
  title?: string
}
</script>

<script lang="ts" setup>
import { useSlots } from 'vue'

const slots = useSlots()
const {
  variant = 'outlined',
  tone = 'primary',
  size = 'medium',
  label,
  title,
} = defineProps<Properties>()
</script>

<style scoped>
@layer components {
  .chip {
    --accent-color: var(--tone-color);
    --chip-block-size: 1.5rem;
    --bg: transparent;
    --border-width: 0;
    --border-color: oklch(from var(--accent-color) l c h / 0.3);
    --padding-inline: 0.5rem;
    --gap-x: 0.375rem;
    --radius: var(--radius-lg);
    --font-size: var(--font-size-xs);

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: 0;
    max-inline-size: 100%;
    block-size: var(--chip-block-size);
    padding-inline: var(--padding-inline);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--radius);
    background-color: var(--bg);
    color: var(--color, var(--accent-color));
    font-size: var(--font-size);
    line-height: var(--line-height-tight);
    cursor: var(--cursor, default);
    column-gap: var(--gap-x);

    & > :is(.leading, .main, .trailing) {
      min-inline-size: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    & > :is(.leading, .trailing) {
      flex: 0 0 auto;
    }

    & > .main {
      flex: 1 1 auto;

      & > span.label {
        display: block;
        min-inline-size: 0;
        max-inline-size: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &[data-size='small'] {
      --chip-block-size: 1.25rem;
      --font-size: var(--font-size-xxs);
      --padding-inline: 0.375rem;
      --gap-x: var(--space-xxs);
      --radius: var(--radius-md);
    }

    &[data-size='large'] {
      --chip-block-size: 1.75rem;
      --font-size: var(--font-size-sm);
      --padding-inline: 0.625rem;
      --gap-x: var(--space-xs);
    }

    &[data-variant='outlined'] {
      --border-width: 1px;
    }

    &[data-variant='filled'] {
      --bg: var(--accent-color);
      --color: var(--white);
    }

    &[data-variant='tonal'] {
      --bg: oklch(from var(--accent-color) l c h / 0.15);
      --color: light-dark(
        oklch(from var(--accent-color) calc(l - 0.1) c h),
        oklch(from var(--accent-color) calc(l + 0.1) c h)
      );
    }
  }
}
</style>
