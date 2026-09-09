<template>
  <div class="buttons-view">
    <section>
      <MSectionHeader description="All button tones across outlined, filled, text, and tonal presentations">
        Regular buttons
      </MSectionHeader>

      <div v-for="variant in regularVariants" :key="variant" class="variant-group">
        <strong>{{ variant }}</strong>
        <MCluster class="samples">
          <MButton v-for="tone in tones" :key="tone" :tone :variant>
            <MIcon :icon="UserIcon" size="1rem" />
            {{ tone }}
          </MButton>
        </MCluster>
      </div>
    </section>

    <section>
      <MSectionHeader description="Icon-only actions keep their accessible name outside the visual content">
        Icon buttons
      </MSectionHeader>

      <MCluster class="samples">
        <MButton
          v-for="tone in tones"
          :key="tone"
          :aria-label="`${tone} action`"
          :title="`${tone} action`"
          :tone
          variant="icon"
        >
          <MIcon :icon="UserIcon" size="1rem" />
        </MButton>
      </MCluster>
    </section>

    <section>
      <MSectionHeader description="Disabled state across regular button variants and tones"> Disabled </MSectionHeader>

      <div v-for="variant in regularVariants" :key="variant" class="variant-group">
        <strong>{{ variant }}</strong>
        <MCluster class="samples">
          <MButton v-for="tone in tones" :key="tone" :tone :variant disabled @click="() => console.debug('click')">
            {{ tone }}
          </MButton>
        </MCluster>
      </div>
    </section>

    <section>
      <MSectionHeader description="Loading state keeps button geometry stable while replacing its content state">
        Loading
      </MSectionHeader>

      <div v-for="variant in regularVariants" :key="variant" class="variant-group">
        <strong>{{ variant }}</strong>
        <MCluster class="samples">
          <MButton v-for="tone in tones" :key="tone" :tone :variant loading>{{ tone }}</MButton>
        </MCluster>
      </div>
    </section>

    <section>
      <MSectionHeader description="Small, medium, and large sizing is independent from presentation variant">
        Sizes
      </MSectionHeader>

      <div v-for="variant in regularVariants" :key="variant" class="variant-group">
        <strong>{{ variant }}</strong>
        <MCluster align="baseline" class="samples">
          <MButton v-for="size in sizes" :key="size" :size :variant tone="primary">{{ size }}</MButton>
        </MCluster>
      </div>
    </section>

    <section>
      <MSectionHeader description="Tooltip attached to an external focusable anchor"> Tooltip </MSectionHeader>

      <span ref="tooltipAnchor" class="tooltip-anchor" tabindex="0">Hover or focus</span>
      <MTooltip :anchor="tooltipAnchor" text="Tooltip attached to an external anchor" />
    </section>

    <section>
      <MSectionHeader description="Click any button to exercise the transient loading state">
        Interactive
      </MSectionHeader>

      <div v-for="variant in regularVariants" :key="variant" class="variant-group">
        <strong>{{ variant }}</strong>
        <MCluster class="samples">
          <MButton v-for="tone in tones" :key="tone" :loading :tone :variant @click="setLoading">
            <MIcon :icon="UserIcon" size="1rem" />
            {{ tone }}
          </MButton>
        </MCluster>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue'
import { UserIcon } from '@lucide/vue'

import MButton, { type Size, type Variant } from '@/lib/components/buttons/MButton.vue'
import type { ComponentTone } from '@/lib/components/component.types'
import MCluster from '@/lib/components/layout/MCluster.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MTooltip from '@/lib/components/overlay/MTooltip.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'

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
