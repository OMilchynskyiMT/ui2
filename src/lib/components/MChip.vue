<template>
  <component :is="tag" :data-size="size" :data-tone="tone" :data-variant="variant" :title="title" class="chip">
    <span v-if="slots.leading" class="leading"><slot name="leading" /></span>
    <span class="main">
      <span class="label">
        <slot name="default">{{ label ?? '' }}</slot>
      </span>
    </span>
    <span v-if="slots.trailing" class="trailing"><slot name="trailing" /></span>

    <MButton
      v-if="closable"
      aria-label="Close"
      class="close"
      label="✕"
      size="small"
      title="Close"
      tone="neutral"
      variant="icon"
      @click.prevent="emit('close')"
    />
  </component>
</template>

<script lang="ts">
import type { ComponentTone } from './component.types'

export type Variant = 'outlined' | 'filled' | 'tonal' | 'text'
export type Size = 'small' | 'medium' | 'large'

export type Properties = {
  tag?: 'span' | 'sup' | 'sub'
  variant?: Variant
  tone?: ComponentTone
  size?: Size
  closable?: boolean
  label?: string
  title?: string
}
</script>

<script lang="ts" setup>
import { useSlots } from 'vue'

import MButton from './buttons/MButton.vue'

const slots = useSlots()
const {
  tag = 'span',
  variant = 'outlined',
  tone = 'primary',
  size = 'medium',
  label,
  title,
  closable = false,
} = defineProps<Properties>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
@layer components {
  .chip {
    --accent-color: var(--tone-color);
    --bg: transparent;
    --border-width: 0;
    --border-color: oklch(from var(--accent-color) l c h / 0.25);
    --padding-inline: var(--space-sm);
    --padding-block: 0;
    --gap-x: var(--space-xs);
    --radius: var(--radius-md);
    --font-size: var(--font-size-sm);

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: 0;
    max-inline-size: 100%;

    padding-inline: var(--padding-inline);
    padding-block: var(--padding-block);
    column-gap: var(--gap-x);
    border-radius: var(--radius);
    cursor: var(--cursor, default);
    font-size: var(--font-size);
    border: var(--border-width) solid var(--border-color);
    background-color: var(--bg);
    color: var(--color, var(--accent-color));

    & > :is(.button.close) {
      --padding-inline: 0;
      --padding-block: 0;
      --font-size: var(--font-size);
      --color: currentColor;
    }

    & > :is(.leading, .main, .trailing) {
      block-size: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    & > :is(.leading, .trailing) {
      flex: 0 0 auto;
    }

    & > .main {
      flex: 1 1 auto;
      min-inline-size: 0;

      & > span.label {
        display: block;
        align-content: center;
        min-inline-size: 0;
        max-inline-size: 100%;
        block-size: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: normal;
      }
    }

    &[data-size='small'] {
      --radius: var(--radius-sm);
      --font-size: var(--font-size-xxs);
      --padding-inline: var(--space-xxs);
      --gap-x: var(--space-xxs);
    }
    &[data-size='medium'] {
      --padding-block: var(--space-xxs);
      --padding-inline: var(--space-xs);
      --font-size: var(--font-size-xs);
    }
    &[data-size='large'] {
      --radius: var(--radius-lg);
      --font-size: var(--font-size-sm);
      --padding-inline: var(--space-sm);
      --padding-block: var(--space-xs);
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
      --bg: oklch(from var(--accent-color) l c h / 0.2);
    }
  }
}
</style>
