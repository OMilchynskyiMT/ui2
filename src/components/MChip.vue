<template>
  <component :is="tag" :data-kind="kind" :data-size="size" :data-variant="variant" :title="title" class="chip">
    <div v-if="slots.leading"><slot name="leading" /></div>
    <main>
      <span class="label">
        <slot name="default">{{ label ?? '' }}</slot>
      </span>
    </main>
    <div v-if="slots.trailing"><slot name="trailing" /></div>

    <MButton
      v-if="closable"
      class="close"
      kind="neutral"
      label="✕"
      size="small"
      title="Close"
      variant="icon"
      @click.prevent="emit('close')"
    />
  </component>
</template>

<script lang="ts">
export type Variant = 'outlined' | 'filled' | 'tonal' | 'text'
export type Kind = 'primary' | 'attention' | 'success' | 'neutral' | 'caution'
export type Size = 'small' | 'medium' | 'large'

export type Properties = {
  tag?: 'span' | 'sup' | 'sub'
  variant?: Variant
  kind?: Kind
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
  kind = 'primary',
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
    --accent-color: currentColor;
    --bg: transparent;
    --font-size: var(--font-size-sm);
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

    & > :is(div, main) {
      block-size: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    & > div {
      flex: 0 0 auto;
    }

    & > main {
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
    /* &[data-variant='text'] { */
    /*   --color: var(--accent-color); */
    /* } */

    &[data-kind='primary'] {
      --accent-color: light-dark(var(--blue-500), var(--blue-500));
    }
    &[data-kind='attention'] {
      --accent-color: light-dark(var(--orange-400), var(--orange-600));
    }
    &[data-kind='success'] {
      --accent-color: light-dark(var(--green-600), var(--green-500));
    }
    &[data-kind='neutral'] {
      --accent-color: light-dark(var(--gray-400), var(--gray-500));
    }
    &[data-kind='caution'] {
      --accent-color: light-dark(var(--red-500), var(--red-600));
    }
  }
}
</style>
