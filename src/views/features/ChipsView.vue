<template>
  <div>
    <section>
      <h2>Size: medium</h2>
      <div class="content">
        <div v-for="{ tone, variant } in all()" :key="`${tone}-${variant}`">
          <MChip :tone="tone" :variant="variant" closable>
            <template #leading><MIcon :icon="UserIcon" size="0.75rem" /></template>
            <template #trailing><MIcon :icon="LockOpenIcon" size="0.75rem" /></template>
            {{ `${tone} ${variant}` }}
          </MChip>
        </div>
      </div>
    </section>

    <section>
      <h2>Size: small</h2>
      <div class="content">
        <div v-for="{ tone, variant } in all()" :key="`${tone}-${variant}`">
          123<MChip tag="sup" :tone="tone" :variant="variant" size="small">
            123
          </MChip>
        </div>
      </div>
    </section>

    <section>
      <h2>Size: large</h2>
      <div class="content">
        <div v-for="{ tone, variant } in all()" :key="`${tone}-${variant}`">
          <MChip :tone="tone" :variant="variant" closable size="large" @close="() => console.debug('close pressed')">
            <template #leading><MIcon :icon="UserIcon" size="0.75rem" /></template>
            <template #trailing><MIcon :icon="LockOpenIcon" size="0.75rem" /></template>
            {{ `${tone} ${variant}` }}
          </MChip>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { LockOpenIcon, UserIcon } from '@lucide/vue'

import type { ComponentTone } from '@/lib/components/component.types'
import MChip, { type Variant } from '@/lib/components/MChip.vue'
import MIcon from '@/lib/components/MIcon.vue'

const variants = ['outlined', 'filled', 'text', 'tonal'] as const
const tones = ['primary', 'info', 'success', 'warning', 'danger', 'neutral'] as const
const all = (): { tone: ComponentTone; variant: Variant }[] => {
  const result: { tone: ComponentTone; variant: Variant }[] = []
  for (const tone of tones) {
    for (const variant of variants) {
      result.push({ tone, variant })
    }
  }
  return result
}
</script>

<style scoped>
section {
  display: grid;
  gap: 2rem;
  margin-block-end: 2rem;

  & > div.content {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: 1rem;
  }
}
</style>
