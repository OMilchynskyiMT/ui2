<template>
  <UiBar class="dashboard-card-header">
    <template v-if="icon" #leading>
      <span aria-hidden="true" class="visual">
        <UiIcon :icon="icon" size="1.5rem" />
      </span>
    </template>

    <UiStack class="heading" gap="var(--space-xxs)">
      <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
      <h3 class="title">{{ title }}</h3>
      <span v-if="description" class="description">{{ description }}</span>
    </UiStack>

    <template v-if="slots.actions" #trailing>
      <slot name="actions" />
    </template>
  </UiBar>
</template>

<script lang="ts" setup>
import { type Component, useSlots } from 'vue'

import UiBar from '@/lib/components/bars/UiBar.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiIcon from '@/lib/components/UiIcon.vue'

const slots = useSlots()
const { icon, eyebrow, title, description } = defineProps<{
  icon?: Component
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<style scoped>
@layer components {
  .dashboard-card-header {
    --bar-sections-gap: var(--space-md);

    align-items: center;

    & .visual {
      inline-size: 2.75rem;
      block-size: 2.75rem;
      display: grid;
      place-items: center;
      border-radius: var(--radius-lg);
      background: color-mix(in oklab, var(--tone-primary) 12%, transparent);
      color: var(--tone-primary);
    }

    & .heading {
      min-inline-size: 0;

      & > :is(.eyebrow, .description) {
        overflow: hidden;
        color: var(--text-color-dimmed);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      & > .title {
        min-inline-size: 0;
        margin: 0;
        overflow: hidden;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-medium);
        line-height: var(--line-height-tight);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      & > .description {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-normal);
      }
    }
  }
}
</style>
