<template>
  <div>
    <section>
      <h2>Size: medium</h2>
      <div class="content">
        <div v-for="{ kind, variant } in all()" :key="`${kind}-${variant}`">
          <MChip :kind="kind" :variant="variant" closable>
            <template #leading><MIcon :icon="UserIcon" size="0.75rem" /></template>
            <template #trailing><MIcon :icon="LockOpenIcon" size="0.75rem" /></template>
            {{ `${kind} ${variant}` }}
          </MChip>
        </div>
      </div>
    </section>

    <section>
      <h2>Size: small</h2>
      <div class="content">
        <div v-for="{ kind, variant } in all()" :key="`${kind}-${variant}`">
          123<MChip tag="sup" :kind="kind" :variant="variant" size="small">
            123
          </MChip>
        </div>
      </div>
    </section>

    <section>
      <h2>Size: large</h2>
      <div class="content">
        <div v-for="{ kind, variant } in all()" :key="`${kind}-${variant}`">
          <MChip :kind="kind" :variant="variant" closable size="large" @close="() => console.debug('close pressed')">
            <template #leading><MIcon :icon="UserIcon" size="0.75rem" /></template>
            <template #trailing><MIcon :icon="LockOpenIcon" size="0.75rem" /></template>
            {{ `${kind} ${variant}` }}
          </MChip>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { LockOpenIcon, UserIcon } from '@lucide/vue'

import MChip, { type Kind, type Variant } from '@/components/MChip.vue'
import MIcon from '@/components/MIcon.vue'

const variants = ['outlined', 'filled', 'text', 'tonal'] as const
const kinds = ['primary', 'attention', 'success', 'neutral', 'caution'] as const
const all = (): { kind: Kind; variant: Variant }[] => {
  const result: { kind: Kind; variant: Variant }[] = []
  for (const kind of kinds) {
    for (const variant of variants) {
      result.push({ kind, variant })
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