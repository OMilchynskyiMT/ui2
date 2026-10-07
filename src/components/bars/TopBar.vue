<template>
  <UiBar class="top-bar">
    <template #leading>
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
</script>

<style scoped>
.top-bar {
  --bar-min-block-size: calc(3rem + var(--safe-area-top));
  --bar-sections-gap: var(--space-lg);
  --bar-padding-block-start: var(--safe-area-top);
  --bar-padding-inline-start: max(var(--space-md), var(--safe-area-left));
  --bar-padding-inline-end: max(var(--space-md), var(--safe-area-right));
  --bar-background: var(--surface-header);

  box-shadow: inset 0 calc(-1 * var(--border-width-thin)) var(--divider-color);
  isolation: isolate;
}

div.product {
  display: grid;

  & > div.info {
    display: flex;
    gap: var(--space-md);
    font-size: var(--font-size-xs);
    color: var(--text-color-dimmed);
  }

  & > * {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
