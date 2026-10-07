<template>
  <UiCard class="service-status-list" padding="medium">
    <UiAutoGrid class="services" gap="var(--space-sm)" min-item-size="13.5rem">
      <UiBar v-for="service in services" :key="service.label" class="service">
        <template #leading>
          <span :class="['indicator', { active: service.active }]" aria-hidden="true" />
        </template>

        <strong>{{ service.label }}</strong>

        <template #trailing>
          <UiChip
            :label="service.active ? 'Active' : 'Inactive'"
            :tone="service.active ? 'success' : 'neutral'"
            size="small"
            variant="tonal"
          />
        </template>
      </UiBar>
    </UiAutoGrid>
  </UiCard>
</template>

<script lang="ts">
export type DashboardService = Readonly<{
  label: string
  active: boolean
}>
</script>

<script lang="ts" setup>
import UiBar from '@/lib/components/bars/UiBar.vue'
import UiAutoGrid from '@/lib/components/grid/UiAutoGrid.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiChip from '@/lib/components/UiChip.vue'

const { services } = defineProps<{
  services: readonly DashboardService[]
}>()
</script>

<style scoped>
@layer components {
  .services {
    & > .service {
      --bar-sections-gap: var(--space-sm);
      --bar-items-gap: var(--space-sm);
      --bar-padding-block: var(--space-xs);
      --bar-padding-inline: var(--space-sm);

      min-block-size: 2.5rem;
      border: var(--border-width-thin) solid var(--divider-color);
      border-radius: var(--radius-lg);
      background: var(--surface-card);

      & > :deep(.main) > strong {
        display: block;
        overflow: hidden;
        font-size: var(--font-size-sm);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      & .indicator {
        inline-size: 0.5em;
        block-size: 0.5em;
        border-radius: var(--radius-full);
        background: var(--tone-neutral);

        &.active {
          background: var(--tone-success);
        }
      }
    }
  }
}
</style>
