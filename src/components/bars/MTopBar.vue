<template>
  <MBar>
    <template #leading>
      <img v-if="resolvedScheme === 'light'" src="/images/MT-logo.svg" class="u-hidden-below-md" width="180" />
      <img v-else src="/images/MT-logo-light.svg" class="u-hidden-below-md" width="180" />
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
  </MBar>
</template>

<script lang="ts" setup>
import MBar from '@/lib/components/bars/MBar.vue'
import { useColorScheme } from '@/composables/useColorScheme'

const { scheme: resolvedScheme } = useColorScheme()
</script>

<style scoped>
.bar {
  --height: calc(3rem + var(--safe-area-top));
  --sections-gap: var(--space-lg);
  --padding-inline: max(var(--space-md), var(--safe-area-left), var(--safe-area-right));
  --bg: var(--surface-bg);
  border-bottom: 1px solid light-dark(var(--gray-200), var(--gray-700));
  isolation: isolate;
}

div.product {
  display: grid;
  gap: var(--space-xxs);

  & > div.info {
    display: flex;
    gap: var(--space-md);
    font-size: var(--font-size-sm);
    color: var(--gray-500);
  }

  & * {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
