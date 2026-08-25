<template>
  <div class="empty-state">
    <div v-if="slots.icon || icon" aria-hidden="true" class="icon">
      <slot name="icon">
        <MIcon v-if="icon" :icon="icon" />
      </slot>
    </div>

    <div class="content">
      <h3 v-if="title">{{ title }}</h3>
      <p v-if="description">{{ description }}</p>
      <slot />
    </div>

    <div v-if="slots.actions" class="actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts">
import type { Component } from 'vue'

export type MEmptyStateProperties = {
  title?: string
  description?: string
  icon?: Component
}
</script>

<script lang="ts" setup>
import { useSlots } from 'vue'

import MIcon from '../MIcon.vue'

const { title, description, icon } = defineProps<MEmptyStateProperties>()
const slots = useSlots()
</script>

<style scoped>
@layer components {
  .empty-state {
    display: grid;
    justify-items: center;
    gap: var(--space-md);
    inline-size: 100%;
    padding: var(--space-xl);
    text-align: center;
    color: var(--text-color-dimmed);

    & > .icon {
      display: grid;
      place-items: center;

      & > svg {
        --size: 2rem;
      }
    }

    & > .content {
      display: grid;
      gap: var(--space-xs);
      max-inline-size: 32rem;

      & > h3 {
        color: var(--text-color);
      }
    }

    & > .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--space-sm);
    }
  }
}
</style>
