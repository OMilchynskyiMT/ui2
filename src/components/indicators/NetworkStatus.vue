<template>
  <UiCard
    role="status"
    :data-tone="online ? 'success' : 'danger'"
    aria-atomic="true"
    aria-live="polite"
    class="network-status"
    padding="medium"
  >
    <UiBar class="status-content">
      <template #leading>
        <span aria-hidden="true" class="visual">
          <UiIcon :icon="Globe2Icon" size="1.75rem" />
        </span>
      </template>

      <UiStack class="heading" gap="var(--space-xxs)" tag="span">
        <span class="label">{{ label }}</span>
        <strong class="value">{{ online ? 'Online' : 'Offline' }}</strong>
      </UiStack>

      <template #trailing>
        <span aria-hidden="true" class="state">
          <UiIcon :icon="online ? CheckIcon : XIcon" :stroke-width="2.5" size="1rem" />
        </span>
      </template>
    </UiBar>
  </UiCard>
</template>

<script lang="ts" setup>
import { CheckIcon, Globe2Icon, XIcon } from '@lucide/vue'

import UiBar from '@/lib/components/bars/UiBar.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
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
    --status-container: color-mix(in oklab, var(--status-color) 14%, transparent);

    --card-radius: var(--radius-lg);
    --card-bg: color-mix(in oklab, var(--status-color) 6%, var(--surface-card));

    & .status-content {
      --bar-sections-gap: var(--space-md);
    }

    & .visual {
      inline-size: 3.25rem;
      block-size: 3.25rem;
      display: grid;
      place-items: center;
      border-radius: var(--radius-lg);
      background: var(--status-container);
      color: var(--status-color);
    }

    & .heading {
      min-inline-size: 0;

      & > .label {
        color: var(--text-color-dimmed);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        line-height: 1.25;
      }

      & > .value {
        color: var(--text-color);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-medium);
        line-height: 1.2;
      }
    }

    & .state {
      inline-size: 2rem;
      block-size: 2rem;
      display: grid;
      place-items: center;
      border-radius: var(--radius-full);
      background: var(--status-color);
      color: var(--on-accent-color);
      box-shadow: 0 0 0 0.25rem var(--status-container);
    }
  }
}
</style>
