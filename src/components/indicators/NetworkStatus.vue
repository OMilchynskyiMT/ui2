<template>
  <UiCard
    role="status"
    :data-tone="online ? 'success' : 'danger'"
    aria-atomic="true"
    aria-live="polite"
    class="network-status"
    padding="medium"
    variant="filled"
  >
    <span aria-hidden="true" class="visual">
      <UiIcon :icon="Globe2Icon" size="1.75rem" />
    </span>

    <span class="heading">
      <span class="label">{{ label }}</span>
      <strong class="value">{{ online ? 'Online' : 'Offline' }}</strong>
    </span>

    <span aria-hidden="true" class="state">
      <UiIcon :icon="online ? CheckIcon : XIcon" :stroke-width="2.5" size="1rem" />
    </span>
  </UiCard>
</template>

<script lang="ts" setup>
import { CheckIcon, Globe2Icon, XIcon } from '@lucide/vue'

import UiCard from '@/lib/components/section/UiCard.vue'
import UiIcon from '@/lib/components/UiIcon.vue'

const { label = 'Internet', online } = defineProps<{
  label?: string
  online: boolean
}>()
</script>

<style scoped>
@layer components {
  .network-status {
    --status-color: var(--tone-color);
    --status-container: color-mix(in oklch, var(--status-color) 14%, transparent);

    --display: grid;
    --card-radius: var(--radius-xl);
    --card-bg: color-mix(in oklch, var(--status-color) 6%);

    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-md);

    & > .visual {
      inline-size: 3.25rem;
      block-size: 3.25rem;
      display: grid;
      place-items: center;
      border-radius: var(--radius-xl);
      background: var(--status-container);
      color: var(--status-color);
    }

    & > .heading {
      min-inline-size: 0;
      display: grid;
      gap: var(--space-xxs);

      & > .label {
        color: var(--text-color-dimmed);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        line-height: 1.25;
      }

      & > .value {
        color: var(--text-color);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        line-height: 1.2;
      }
    }

    & > .state {
      inline-size: 2rem;
      block-size: 2rem;
      display: grid;
      place-items: center;
      border-radius: var(--radius-full);
      background: var(--status-color);
      color: var(--white);
      box-shadow: 0 0 0 0.25rem var(--status-container);
    }
  }
}
</style>
