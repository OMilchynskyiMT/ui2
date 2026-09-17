<template>
  <div class="buttons-view">
    <section>
      <UiSectionHeader description="All button tones across outlined, filled, text, and tonal presentations. Adaptive.">
        Regular buttons
      </UiSectionHeader>

      <div v-for="variant in regularVariants" :key="variant" class="variant-group">
        <strong>{{ variant }}</strong>
        <UiCluster class="samples">
          <UiButton v-for="tone in tones" :key="tone" :icon="UserIcon" :tone :variant layout="adaptive">
            {{ tone }}
          </UiButton>
        </UiCluster>
      </div>
    </section>

    <section>
      <UiSectionHeader description="Icon-only actions keep their accessible name outside the visual content">
        Icon buttons
      </UiSectionHeader>

      <UiCluster class="samples">
        <UiButton
          v-for="tone in tones"
          :key="tone"
          :aria-label="`${tone} action`"
          :icon="UserIcon"
          :title="`${tone} action`"
          :tone
          layout="icon"
          variant="text"
        />
      </UiCluster>
    </section>

    <section>
      <UiSectionHeader description="Disabled state across regular button variants and tones">
        Disabled
      </UiSectionHeader>

      <div v-for="variant in regularVariants" :key="variant" class="variant-group">
        <strong>{{ variant }}</strong>
        <UiCluster class="samples">
          <UiButton v-for="tone in tones" :key="tone" :tone :variant disabled @click="() => console.debug('click')">
            {{ tone }}
          </UiButton>
        </UiCluster>
      </div>
    </section>

    <section>
      <UiSectionHeader description="Loading state keeps button geometry stable while replacing its content state">
        Loading
      </UiSectionHeader>

      <div v-for="variant in regularVariants" :key="variant" class="variant-group">
        <strong>{{ variant }}</strong>
        <UiCluster class="samples">
          <UiButton v-for="tone in tones" :key="tone" :tone :variant loading>{{ tone }}</UiButton>
        </UiCluster>
      </div>
    </section>

    <section>
      <UiSectionHeader description="Small, medium, and large sizing is independent from presentation variant">
        Sizes
      </UiSectionHeader>

      <div v-for="variant in regularVariants" :key="variant" class="variant-group">
        <strong>{{ variant }}</strong>
        <UiCluster align="baseline" class="samples">
          <UiButton v-for="size in sizes" :key="size" :size :variant tone="primary">{{ size }}</UiButton>
        </UiCluster>
      </div>
    </section>

    <section>
      <UiSectionHeader description="Tooltip attached to an external focusable anchor"> Tooltip </UiSectionHeader>

      <span ref="tooltipAnchor" class="tooltip-anchor" tabindex="0">Hover or focus</span>
      <UiTooltip :anchor="tooltipAnchor" text="Tooltip attached to an external anchor" />
    </section>

    <section>
      <UiSectionHeader description="Click any button to exercise the transient loading state">
        Interactive
      </UiSectionHeader>

      <div v-for="variant in regularVariants" :key="variant" class="variant-group">
        <strong>{{ variant }}</strong>
        <UiCluster class="samples">
          <UiButton v-for="tone in tones" :key="tone" :icon="UserIcon" :loading :tone :variant @click="setLoading">
            {{ tone }}
          </UiButton>
        </UiCluster>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue'
import { UserIcon } from '@lucide/vue'

import UiButton, { type Size, type Variant } from '@/lib/components/buttons/UiButton.vue'
import type { ComponentTone } from '@/lib/components/component.types'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiTooltip from '@/lib/components/overlay/UiTooltip.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'

const regularVariants: Variant[] = ['outlined', 'filled', 'text', 'tonal']
const tones: ComponentTone[] = ['primary', 'info', 'success', 'warning', 'danger', 'neutral']
const sizes: Size[] = ['small', 'medium', 'large']

const loading = ref(false)
const tooltipAnchor = useTemplateRef<HTMLSpanElement>('tooltipAnchor')

const setLoading = (): void => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<style scoped>
.buttons-view {
  min-inline-size: 0;
  display: grid;
  gap: var(--space-xxl);

  & > section,
  & .variant-group {
    min-inline-size: 0;
    display: grid;
  }

  & > section {
    gap: var(--space-xl);
  }

  & .variant-group {
    gap: var(--space-md);

    & > strong {
      color: var(--text-color-dimmed);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      text-transform: capitalize;
    }
  }

  & .samples {
    --cluster-gap: var(--space-lg);
  }
}

.tooltip-anchor {
  justify-self: start;
  inline-size: max-content;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--divider-color);
  border-radius: var(--radius-md);
  cursor: help;
}
</style>
