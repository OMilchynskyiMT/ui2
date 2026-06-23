<template>
  <div :data-kind="kind" :data-size="size" :data-variant="variant" :title="title" class="chip">
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
  </div>
</template>

<script lang="ts">
export type Variant = 'outlined' | 'filled' | 'tonal' | 'text'
export type Kind = 'primary' | 'attention' | 'success' | 'neutral' | 'caution'
export type Size = 'small' | 'medium' | 'large'

export type Properties = {
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
.chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 0;
  max-inline-size: 100%;

  --accent-color: currentColor;
  --font-size: var(--font-size-sm);
  padding-inline: var(--padding-inline, var(--space-sm));
  block-size: var(--block-size, calc(var(--font-size) * 2));
  column-gap: var(--gap-x, var(--space-xs));
  border-radius: var(--radius, var(--radius-md));
  cursor: var(--cursor, default);
  font-size: var(--font-size);
  border: var(--border-width, 0px) solid var(--border-color, var(--accent-color));
  background-color: var(--bg, transparent);
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
    }
  }

  &[data-size='small'] {
    --radius: var(--radius-sm);
    --font-size: var(--font-size-xs);
    --padding-inline: var(--space-xs);
    --padding-block: var(--space-xxs);
    --gap-x: var(--space-xxs);
  }
  &[data-size='large'] {
    --radius: var(--radius-lg);
    --font-size: var(--font-size-md);
    --padding-inline: var(--space-sm);
    --padding-block: var(--space-sm);
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
    --accent-color: light-dark(var(--green-500), var(--green-500));
  }
  &[data-kind='neutral'] {
    --accent-color: light-dark(var(--gray-400), var(--gray-500));
  }
  &[data-kind='caution'] {
    --accent-color: light-dark(var(--red-500), var(--red-600));
  }
}
</style>
