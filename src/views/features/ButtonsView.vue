<template>
  <main>
    <section>
      <h2>Regular buttons</h2>
      <div v-for="variant in variants" :key="variant" class="container">
        <div v-for="tone in tones" :key="tone">
          <MButton :tone="tone" :variant="variant">
            <MIcon :icon="UserIcon" size="1rem" />
            {{ tone }}
          </MButton>
        </div>
      </div>
    </section>

    <section>
      <h2>Disabled</h2>

      <div v-for="variant in regularVariants" :key="variant" class="container">
        <div v-for="tone in tones" :key="tone">
          <MButton :tone="tone" :variant="variant" disabled @click="() => console.debug('click')">{{ tone }}</MButton>
        </div>
      </div>
    </section>

    <section>
      <h2>Loading</h2>

      <div v-for="variant in regularVariants" :key="variant" class="container">
        <div v-for="tone in tones" :key="tone">
          <MButton :tone="tone" :variant="variant" loading>{{ tone }}</MButton>
        </div>
      </div>
    </section>

    <section>
      <h2>Sizes</h2>

      <div v-for="variant in regularVariants" :key="variant" class="container">
        <div v-for="size in sizes" :key="size">
          <MButton :size="size" :variant="variant" tone="primary">{{ size }}</MButton>
        </div>
      </div>
    </section>

    <section>
      <h2>Tooltip</h2>
      <div class="container">
        <span ref="tooltipAnchor" class="tooltip-anchor" tabindex="0">Hover or focus</span>
        <MTooltip :anchor="tooltipAnchor" text="Tooltip attached to an external anchor" />
      </div>
    </section>

    <section>
      <h2>Interactive</h2>

      <div v-for="variant in regularVariants" :key="variant" class="container">
        <div v-for="tone in tones" :key="tone">
          <MButton :loading="loading" :tone="tone" :variant="variant" @click="setLoading">
            <MIcon :icon="UserIcon" size="1rem" />
            {{ tone }}
          </MButton>
        </div>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue'
import { UserIcon } from '@lucide/vue'

import MButton, { type Size, type Variant } from '@/lib/components/buttons/MButton.vue'
import type { ComponentTone } from '@/lib/components/component.types'
import MIcon from '@/lib/components/MIcon.vue'
import MTooltip from '@/lib/components/overlay/MTooltip.vue'

const variants: Variant[] = ['outlined', 'filled', 'text', 'tonal', 'icon']
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
main {
  display: grid;
  gap: 3rem;

  & > section {
    display: grid;
    gap: 2rem;

    & > div.container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
      gap: 2rem;
    }
  }
}

.tooltip-anchor {
  inline-size: max-content;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--divider-color);
  border-radius: var(--radius-md);
  cursor: help;
}
</style>
