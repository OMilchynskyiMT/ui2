<template>
  <UiStack gap="var(--space-xxl)">
    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Vertical composition with explicit spacing and optional cross-axis alignment">
        Stack
      </UiSectionHeader>

      <UiStack class="sample-frame" gap="var(--space-sm)">
        <UiCard v-for="i of 3" :key="i" padding="small">Stack item {{ i }}</UiCard>
      </UiStack>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="A single non-wrapping inline axis for controls that must remain on one line">
        Inline
      </UiSectionHeader>

      <UiInline gap="var(--space-md)">
        <UiButton variant="tonal">Previous</UiButton>
        <UiButton>Continue</UiButton>
      </UiInline>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader
        description="Wrapping inline composition for tags, actions, filters, and other variable-width items"
      >
        Cluster
      </UiSectionHeader>

      <UiCluster gap="var(--space-md)">
        <UiButton v-for="i of 8" :key="i" tone="neutral" variant="tonal">Action {{ i }}</UiButton>
      </UiCluster>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader description="Explicit equal-width tracks with container-based responsive column counts">
        Grid
      </UiSectionHeader>

      <UiGrid :columns="{ base: 1, medium: 2, large: 4 }" gap="var(--space-lg)">
        <UiCard v-for="i of blocks" :key="i" class="sample-card" padding="small">Grid item {{ i }}</UiCard>
      </UiGrid>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader
        description="Grid items can own spanning and self-alignment without ambient global utility classes"
      >
        Grid items
      </UiSectionHeader>

      <UiGrid :columns="{ base: 1, medium: 3 }" gap="var(--space-lg)">
        <UiGridItem span="full">
          <UiCard padding="small">Full-width item</UiCard>
        </UiGridItem>
        <UiCard padding="small">Regular item</UiCard>
        <UiGridItem align="center" justify="center">
          <UiButton variant="tonal">Centered item</UiButton>
        </UiGridItem>
        <UiCard padding="small">Regular item</UiCard>
      </UiGrid>
    </UiStack>

    <UiStack gap="var(--space-xl)" tag="section">
      <UiSectionHeader
        description="Intrinsic tracks add or remove columns from available space without breakpoint configuration"
      >
        Auto grid
      </UiSectionHeader>

      <UiAutoGrid gap="var(--space-lg)" min-item-size="12rem">
        <UiCard v-for="i of blocks" :key="i" class="sample-card" padding="small">Auto item {{ i }}</UiCard>
      </UiAutoGrid>
    </UiStack>
  </UiStack>
</template>

<script lang="ts" setup>
import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiAutoGrid from '@/lib/components/grid/UiAutoGrid.vue'
import UiGrid from '@/lib/components/grid/UiGrid.vue'
import UiGridItem from '@/lib/components/grid/UiGridItem.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiInline from '@/lib/components/layout/UiInline.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'

const blocks = 8
</script>

<style scoped>
.sample-frame {
  inline-size: min(100%, 28rem);
}

.sample-card {
  min-block-size: 4rem;
}
</style>
