<template>
  <div class="chips-view">
    <section>
      <MSectionHeader description="Tone and variant combinations with leading, trailing, and close affordances">
        Medium chips
      </MSectionHeader>

      <MCluster class="samples">
        <MChip v-for="{ tone, variant } in combinations" :key="`${tone}-${variant}`" :tone :variant closable>
          <template #leading><MIcon :icon="UserIcon" size="0.75rem" /></template>
          <template #trailing><MIcon :icon="LockOpenIcon" size="0.75rem" /></template>
          {{ `${tone} ${variant}` }}
        </MChip>
      </MCluster>
    </section>

    <section>
      <MSectionHeader description="Compact inline chips suitable for annotations and dense metadata">
        Small chips
      </MSectionHeader>

      <MCluster align="baseline" class="samples">
        <span v-for="{ tone, variant } in combinations" :key="`${tone}-${variant}`">
          123<MChip :tone :variant size="small" tag="sup">123</MChip>
        </span>
      </MCluster>
    </section>

    <section>
      <MSectionHeader description="Large chips retain the same content and close-button behavior">
        Large chips
      </MSectionHeader>

      <MCluster class="samples">
        <MChip
          v-for="{ tone, variant } in combinations"
          :key="`${tone}-${variant}`"
          :tone
          :variant
          closable
          size="large"
          @close="() => console.debug('close pressed')"
        >
          <template #leading><MIcon :icon="UserIcon" size="0.75rem" /></template>
          <template #trailing><MIcon :icon="LockOpenIcon" size="0.75rem" /></template>
          {{ `${tone} ${variant}` }}
        </MChip>
      </MCluster>
    </section>

    <section>
      <MSectionHeader description="Compact status/count indicators across all component tones"> Badges </MSectionHeader>

      <MCluster class="samples">
        <span v-for="tone in tones" :key="`badge-${tone}`">Notifications <MBadge :label="3" :tone /></span>
      </MCluster>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { LockOpenIcon, UserIcon } from '@lucide/vue'

import type { ComponentTone } from '@/lib/components/component.types'
import MCluster from '@/lib/components/layout/MCluster.vue'
import MBadge from '@/lib/components/MBadge.vue'
import MChip, { type Variant } from '@/lib/components/MChip.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'

const variants = ['outlined', 'filled', 'text', 'tonal'] as const
const tones = ['primary', 'info', 'success', 'warning', 'danger', 'neutral'] as const
const combinations: { tone: ComponentTone; variant: Variant }[] = tones.flatMap(tone =>
  variants.map(variant => ({ tone, variant }))
)
</script>

<style scoped>
.chips-view {
  min-inline-size: 0;
  display: grid;
  gap: var(--space-xxl);

  & > section {
    min-inline-size: 0;
    display: grid;
    gap: var(--space-xl);
  }

  & .samples {
    --cluster-gap: var(--space-md);
  }
}
</style>
