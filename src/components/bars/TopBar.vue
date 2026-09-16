<template>
  <UiBar class="top-bar">
    <template #leading>
      <img
        v-if="resolvedScheme === 'light'"
        alt="MultiTech"
        class="u-hidden-below-md"
        src="/images/MT-logo.svg"
        width="180"
      />
      <img v-else alt="MultiTech" class="u-hidden-below-md" src="/images/MT-logo-light.svg" width="180" />
      <slot name="leading" />
    </template>

    <template #trailing>
      <slot name="trailing" />
    </template>

    <div class="product">
      <h3>mPower™ Edge Intelligence Conduit AP</h3>
      <div class="info">
        <span class="model">MTCAP3-L4G2D-WIFI</span>
        <span class="version">Firmware Version 8.0.0-dev1</span>
      </div>
    </div>
  </UiBar>
</template>

<script lang="ts" setup>
import UiBar from '@/lib/components/bars/UiBar.vue'
import { useColorScheme } from '@/composables/useColorScheme'

const { scheme: resolvedScheme } = useColorScheme()
</script>

<style scoped>
.top-bar {
  --height: calc(3rem + var(--safe-area-top));
  --sections-gap: var(--space-lg);
  --padding-block-start: var(--safe-area-top);
  --padding-inline-start: max(var(--space-md), var(--safe-area-left));
  --padding-inline-end: max(var(--space-md), var(--safe-area-right));
  --bg: var(--surface-bg);
  border-bottom: 1px solid var(--divider-color);
  isolation: isolate;
}

div.product {
  display: grid;
  gap: var(--space-xxs);

  & > div.info {
    display: flex;
    gap: var(--space-md);
    font-size: var(--font-size-sm);
    color: var(--text-color-dimmed);
  }

  & * {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
