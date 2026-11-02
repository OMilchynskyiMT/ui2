<template>
  <div :data-tone="tone" class="alert">
    <div v-if="slots.icon || icon" aria-hidden="true" class="icon">
      <slot name="icon">
        <UiIcon :icon="actualIcon" color="var(--alert-accent-color)" size="var(--alert-icon-size)" />
      </slot>
    </div>

    <div class="content">
      <slot />
    </div>

    <div v-if="slots.actions" class="actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts">
import type { FeedbackTone } from '../component.types'

export type UiAlertProperties = {
  tone?: FeedbackTone
  icon?: boolean
}
</script>

<script lang="ts" setup>
import { type Component, computed, useSlots } from 'vue'
import { AlertTriangleIcon, CircleCheckIcon, InfoIcon, LightbulbIcon, OctagonXIcon } from '@lucide/vue'

import UiIcon from '../UiIcon.vue'

const slots = useSlots()
const { tone = 'neutral', icon = true } = defineProps<UiAlertProperties>()
const actualIcon = computed((): Component => {
  switch (tone) {
    case 'info': {
      return InfoIcon
    }
    case 'success': {
      return CircleCheckIcon
    }
    case 'warning': {
      return AlertTriangleIcon
    }
    case 'danger': {
      return OctagonXIcon
    }
    default: {
      return LightbulbIcon
    }
  }
})
</script>

<style scoped>
@layer components {
  .alert {
    --alert-border-width: var(--border-width-thin);
    --alert-icon-size: 1.5rem;
    --alert-accent-color: var(--tone-foreground-color);
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-md);

    padding: var(--space-md) var(--space-lg);

    border: var(--alert-border-width) solid color-mix(in srgb, var(--alert-accent-color) 20%, transparent);
    border-radius: var(--radius-lg);

    background-color: color-mix(in oklab, var(--alert-accent-color) 8%, transparent);

    & > .icon {
      flex: 0 0 var(--alert-icon-size);
      display: flex;
      align-items: center;
      justify-content: center;
      block-size: 1lh;
    }

    > .content {
      flex: 1 1 0;
      min-inline-size: min(10rem, 60%);
      overflow-wrap: anywhere;
    }

    > .actions {
      flex: 0 1 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: flex-end;
      gap: var(--space-md);
      max-inline-size: 100%;
      margin-inline-start: auto;
    }
  }
}
</style>
