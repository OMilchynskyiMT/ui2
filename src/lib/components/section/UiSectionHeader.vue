<template>
  <UiBar class="section-header">
    <template v-if="icon || slots.leading" #leading>
      <span class="leading-visual">
        <UiIcon v-if="icon" :icon="icon" aria-hidden="true" />
        <slot name="leading" />
      </span>
    </template>

    <template v-if="slots.actions" #trailing>
      <slot name="actions" />
    </template>

    <header class="content">
      <h2 :title="hint"><slot /></h2>
      <div v-if="description || slots.description" class="description">
        <slot name="description">{{ description }}</slot>
      </div>
    </header>
  </UiBar>
</template>

<script lang="ts" setup>
import { type Component, useSlots } from 'vue'

import UiBar from '../bars/UiBar.vue'
import UiIcon from '../UiIcon.vue'

const slots = useSlots()

const { icon, hint, description } = defineProps<{
  icon?: Component
  hint?: string
  description?: string
}>()
</script>

<style scoped>
@layer components {
  .section-header {
    --sections-gap: var(--space-sm);

    align-items: start;

    & .leading-visual {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-xxs);
      min-inline-size: 1.75rem;
      block-size: 1.75rem;
      margin-block-start: 0.0625rem;
      color: var(--section-header-icon-color, var(--tone-primary));

      & > :deep(.icon) {
        --size: var(--section-header-icon-size, 1.375rem);
        --color: currentColor;
      }
    }

    & header.content {
      min-inline-size: 0;
      white-space: initial;

      & > h2 {
        font-size: var(--section-header-title-size, var(--font-size-lg));
        font-weight: var(--font-weight-semibold);
        line-height: var(--line-height-tight);
      }

      & > div.description {
        margin-block-start: 0.125rem;
        font-size: var(--font-size-sm);
        line-height: var(--line-height-compact);
        color: var(--text-color-dimmed);
      }
    }
  }
}
</style>
