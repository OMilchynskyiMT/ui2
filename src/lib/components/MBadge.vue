<template>
  <component :is="tag" :data-tone="tone" :data-size="size" class="badge">
    <slot>{{ label }}</slot>
  </component>
</template>

<script lang="ts">
import type { ComponentTone } from './component.types'

export type MBadgeProperties = {
  tag?: 'span' | 'sup'
  tone?: ComponentTone
  size?: 'small' | 'medium'
  label?: string | number
}
</script>

<script lang="ts" setup>
const {
  tag = 'span',
  tone = 'neutral',
  size = 'medium',
  label = '',
} = defineProps<MBadgeProperties>()
</script>

<style scoped>
@layer components {
  .badge {
    --badge-size: 1.25rem;
    --badge-padding-inline: 0.4rem;

    min-inline-size: var(--badge-size);
    block-size: var(--badge-size);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-inline: var(--badge-padding-inline);
    border-radius: var(--radius-full);
    background-color: var(--tone-color);
    color: var(--white);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    line-height: 1;
    white-space: nowrap;

    &[data-size='small'] {
      --badge-size: 1rem;
      --badge-padding-inline: 0.3rem;
      font-size: var(--font-size-xxs);
    }
  }
}
</style>
