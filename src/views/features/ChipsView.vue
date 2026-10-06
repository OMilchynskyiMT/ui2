<template>
  <UiStack gap="var(--space-xxl)">
    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Tone and variant combinations with leading, trailing, and close affordances">
        Medium chips
      </UiSectionHeader>

      <UiCluster gap="var(--space-md)">
        <UiChip v-for="{ tone, variant } in combinations" :key="`${tone}-${variant}`" :tone :variant>
          <template #leading><UiIcon :icon="UserIcon" size="0.75rem" /></template>
          <template #trailing><UiIcon :icon="LockOpenIcon" size="0.75rem" /></template>
          {{ `${tone} ${variant}` }}
        </UiChip>
      </UiCluster>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Dense chips retain chip behavior without doubling as superscript badges">
        Small chips
      </UiSectionHeader>

      <UiCluster gap="var(--space-md)">
        <UiChip v-for="{ tone, variant } in combinations" :key="`${tone}-${variant}`" :tone :variant size="small">
          {{ `${tone} ${variant}` }}
        </UiChip>
      </UiCluster>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Large chips retain the same content and close-button behavior">
        Large chips
      </UiSectionHeader>

      <UiCluster gap="var(--space-md)">
        <UiChip
          v-for="{ tone, variant } in combinations"
          :key="`${tone}-${variant}`"
          :tone
          :variant
          size="large"
          @close="() => console.debug('close pressed')"
        >
          <template #leading><UiIcon :icon="UserIcon" size="0.75rem" /></template>
          <template #trailing><UiIcon :icon="LockOpenIcon" size="0.75rem" /></template>
          {{ `${tone} ${variant}` }}
        </UiChip>
      </UiCluster>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Passive count and status annotations are rendered by the dedicated badge component">
        Badges
      </UiSectionHeader>

      <UiCluster align="baseline" gap="var(--space-md)">
        <span v-for="tone in tones" :key="`badge-${tone}`">Notifications<UiBadge :label="3" :tone tag="sup" /></span>
        <UiBadge label="FAILOVER" size="large" tone="success" />
      </UiCluster>
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import { LockOpenIcon, UserIcon } from '@lucide/vue'

import type { ComponentTone } from '@/lib/components/component.types'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiBadge from '@/lib/components/UiBadge.vue'
import UiChip, { type Variant } from '@/lib/components/UiChip.vue'
import UiIcon from '@/lib/components/UiIcon.vue'

const variants = ['outlined', 'filled', 'text', 'tonal'] as const
const tones = ['primary', 'info', 'success', 'warning', 'danger', 'neutral'] as const
const combinations: { tone: ComponentTone; variant: Variant }[] = tones.flatMap(tone =>
  variants.map(variant => ({ tone, variant }))
)
</script>
