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
    --alert-accent-color: var(--tone-color);
    display: grid;
    align-items: start;
    gap: var(--space-md);

    padding: var(--space-md) var(--space-lg);

    border: var(--alert-border-width) solid color-mix(in srgb, var(--alert-accent-color) 20%, transparent);
    border-radius: var(--radius-lg);

    background-color: color-mix(in oklch, var(--alert-accent-color) 8%, transparent);

    &:has(> .icon) {
      grid-template-columns: var(--alert-icon-size) minmax(0, 1fr);
    }
    &:has(> .actions) {
      grid-template-columns: minmax(0, 1fr) auto;
    }
    &:has(> .icon):has(> .actions) {
      grid-template-columns: var(--alert-icon-size) minmax(0, 1fr) auto;
    }

    & > .icon {
      align-self: start;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    > .content {
      align-self: start;
      min-inline-size: 0;
    }

    > .actions {
      align-self: start;
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
    }
  }
}
</style>
