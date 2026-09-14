<template>
  <div class="alerts-view">
    <section>
      <UiSectionHeader description="Feedback tones with the default icon and full message content">
        Alerts
      </UiSectionHeader>

      <UiFormGrid :columns="{ small: 1, large: 2 }">
        <UiAlert v-for="tone in tones" :key="`default-${tone}`" :tone>
          {{ tone }}. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum provident accusamus cumque
          dolore cum neque eligendi laudantium, reprehenderit, delectus sequi fuga officiis adipisci consectetur maxime
          numquam temporibus, vitae veritatis ut.
        </UiAlert>
      </UiFormGrid>
    </section>

    <section>
      <UiSectionHeader description="Iconless alerts and alerts with custom icon/action content">
        Variants
      </UiSectionHeader>

      <div class="variant-group">
        <strong>Without icons</strong>
        <UiFormGrid :columns="{ small: 1, large: 2 }">
          <UiAlert v-for="tone in tones" :key="`no-icon-${tone}`" :icon="false" :tone>{{ tone }}</UiAlert>
        </UiFormGrid>
      </div>

      <div class="variant-group">
        <strong>Custom icon and action</strong>
        <UiFormGrid :columns="{ small: 1, large: 2 }">
          <UiAlert v-for="tone in tones" :key="`custom-${tone}`" :tone>
            {{ tone }}. Custom icon.
            <template #icon>
              <UiIcon :icon="LockKeyholeOpenIcon" />
            </template>
            <template #actions>
              <UiButton size="small" tone="neutral">Action</UiButton>
            </template>
          </UiAlert>
        </UiFormGrid>
      </div>
    </section>

    <section>
      <UiSectionHeader
        description="Loading, error, empty, and ready states rendered through a single boundary component"
      >
        Async state
      </UiSectionHeader>

      <UiFormGrid>
        <UiCard class="state-example">
          <UiAsyncState loading />
        </UiCard>

        <UiCard class="state-example">
          <UiAsyncState :error="demoError" />
        </UiCard>

        <UiCard class="state-example">
          <UiAsyncState empty>
            <template #empty>
              <UiEmptyState :icon="InboxIcon" description="There are no items to display yet." title="Nothing here">
                <template #actions>
                  <UiButton variant="tonal">Create item</UiButton>
                </template>
              </UiEmptyState>
            </template>
          </UiAsyncState>
        </UiCard>

        <UiCard class="state-example">
          <UiAsyncState>
            <UiAlert tone="success">Content is ready.</UiAlert>
          </UiAsyncState>
        </UiCard>
      </UiFormGrid>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { InboxIcon, LockKeyholeOpenIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import type { FeedbackTone } from '@/lib/components/component.types'
import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiAlert from '@/lib/components/status/UiAlert.vue'
import UiAsyncState from '@/lib/components/status/UiAsyncState.vue'
import UiEmptyState from '@/lib/components/status/UiEmptyState.vue'
import UiIcon from '@/lib/components/UiIcon.vue'

const tones: FeedbackTone[] = ['neutral', 'info', 'success', 'warning', 'danger']
const demoError = new Error('Unable to load data')
</script>

<style scoped>
.alerts-view {
  min-inline-size: 0;
  display: grid;
  gap: var(--space-xxl);

  & > section {
    min-inline-size: 0;
    display: grid;
    gap: var(--space-xl);
  }
}

.variant-group {
  display: grid;
  gap: var(--space-md);

  & > strong {
    color: var(--text-color-dimmed);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
  }
}

.state-example {
  min-block-size: 8rem;
}
</style>
