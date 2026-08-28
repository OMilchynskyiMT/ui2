<template>
  <div :data-adaptive="adaptive || undefined" :data-sticky="sticky || undefined" class="bottom-actions">
    <slot />
  </div>
</template>

<script lang="ts">
export type MBottomActionsProperties = {
  adaptive?: boolean
  sticky?: boolean
}
</script>

<script lang="ts" setup>
const { adaptive = false, sticky = true } = defineProps<MBottomActionsProperties>()
</script>

<style scoped>
@layer components {
  .bottom-actions {
    min-inline-size: 0;
    max-inline-size: 100%;

    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--bottom-actions-gap, var(--space-sm));
  }

  @media (width < container-token(--container-md)) {
    .bottom-actions {
      & > :deep(*) {
        min-block-size: var(--touch-target-min);
      }

      &[data-sticky] {
        position: sticky;
        inset-block-end: 0;
        z-index: var(--bottom-actions-z-index, 10);

        margin-inline: var(--bottom-actions-margin-inline, 0);
        padding: var(--bottom-actions-padding-block, var(--space-md))
          max(var(--bottom-actions-padding-inline, var(--space-md)), var(--safe-area-right))
          max(var(--bottom-actions-padding-block, var(--space-md)), var(--safe-area-bottom))
          max(var(--bottom-actions-padding-inline, var(--space-md)), var(--safe-area-left));
        border: var(--bottom-actions-border-width, 0px) solid var(--bottom-actions-border-color, var(--divider-color));
        border-radius: var(--bottom-actions-radius, var(--radius-md));
        background-color: var(--bottom-actions-bg, color-mix(in oklch, var(--surface-bg) 92%, transparent));
        backdrop-filter: var(--bottom-actions-backdrop-filter, blur(0.5rem));
      }

      &[data-adaptive] {
        & > :deep(*) {
          min-inline-size: 0;
          flex: 1 1 var(--bottom-actions-item-min-size, 10rem);
        }
      }
    }
  }
}
</style>
