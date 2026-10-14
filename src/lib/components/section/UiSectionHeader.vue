<template>
  <UiCluster align="start" class="section-header">
    <div class="heading">
      <span v-if="icon || slots.leading" class="leading-visual">
        <UiIcon v-if="icon" :icon="icon" aria-hidden="true" size="var(--section-header-icon-size, 1.375rem)" />
        <slot name="leading" />
      </span>

      <header class="content">
        <h2 :title="hint"><slot /></h2>
        <div v-if="description || slots.description" class="description">
          <slot name="description">{{ description }}</slot>
        </div>
      </header>
    </div>

    <UiCluster v-if="slots.actions" align="start" class="actions" justify="start">
      <slot name="actions" />
    </UiCluster>
  </UiCluster>
</template>

<script lang="ts" setup>
import { type Component, useSlots } from 'vue'

import UiCluster from '../layout/UiCluster.vue'
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
    inline-size: 100%;

    & .heading {
      display: flex;
      align-items: flex-start;
      flex: 1 1 18rem;
      gap: var(--space-sm);
      /* Keep the heading readable; move actions to another row when space runs out. */
      min-inline-size: min(100%, 16rem);
    }

    & .actions {
      flex: 0 1 auto;
    }

    & .leading-visual {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-xxs);
      min-inline-size: 1.75rem;
      block-size: 1.75rem;
      margin-block-start: 0.0625rem;
      color: var(--section-header-icon-color, var(--tone-primary));
    }

    & header.content {
      min-inline-size: 0;
      white-space: initial;

      & > h2 {
        font-size: var(--section-header-title-size, var(--font-size-lg));
        line-height: var(--line-height-tight);
      }

      & > div.description {
        margin-block-start: var(--space-xxs);
        font-size: var(--font-size-sm);
        line-height: var(--line-height-compact);
        color: var(--text-color-dimmed);
      }
    }
  }
}
</style>
