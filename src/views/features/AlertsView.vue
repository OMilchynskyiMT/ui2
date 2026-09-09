<template>
  <div class="alerts-view">
    <section>
      <MSectionHeader description="Feedback tones with the default icon and full message content">
        Alerts
      </MSectionHeader>

      <MFormGrid :columns="{ small: 1, large: 2 }">
        <MAlert v-for="tone in tones" :key="`default-${tone}`" :tone>
          {{ tone }}. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum provident accusamus cumque
          dolore cum neque eligendi laudantium, reprehenderit, delectus sequi fuga officiis adipisci consectetur maxime
          numquam temporibus, vitae veritatis ut.
        </MAlert>
      </MFormGrid>
    </section>

    <section>
      <MSectionHeader description="Iconless alerts and alerts with custom icon/action content">
        Variants
      </MSectionHeader>

      <div class="variant-group">
        <strong>Without icons</strong>
        <MFormGrid :columns="{ small: 1, large: 2 }">
          <MAlert v-for="tone in tones" :key="`no-icon-${tone}`" :icon="false" :tone>{{ tone }}</MAlert>
        </MFormGrid>
      </div>

      <div class="variant-group">
        <strong>Custom icon and action</strong>
        <MFormGrid :columns="{ small: 1, large: 2 }">
          <MAlert v-for="tone in tones" :key="`custom-${tone}`" :tone>
            {{ tone }}. Custom icon.
            <template #icon>
              <MIcon :icon="LockKeyholeOpenIcon" />
            </template>
            <template #actions>
              <MButton size="small" tone="neutral">Action</MButton>
            </template>
          </MAlert>
        </MFormGrid>
      </div>
    </section>

    <section>
      <MSectionHeader
        description="Loading, error, empty, and ready states rendered through a single boundary component"
      >
        Async state
      </MSectionHeader>

      <MFormGrid>
        <MCard class="state-example">
          <MAsyncState loading />
        </MCard>

        <MCard class="state-example">
          <MAsyncState :error="demoError" />
        </MCard>

        <MCard class="state-example">
          <MAsyncState empty>
            <template #empty>
              <MEmptyState :icon="InboxIcon" description="There are no items to display yet." title="Nothing here">
                <template #actions>
                  <MButton variant="tonal">Create item</MButton>
                </template>
              </MEmptyState>
            </template>
          </MAsyncState>
        </MCard>

        <MCard class="state-example">
          <MAsyncState>
            <MAlert tone="success">Content is ready.</MAlert>
          </MAsyncState>
        </MCard>
      </MFormGrid>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { InboxIcon, LockKeyholeOpenIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import type { FeedbackTone } from '@/lib/components/component.types'
import MFormGrid from '@/lib/components/grid/MFormGrid.vue'
import MIcon from '@/lib/components/MIcon.vue'
import MCard from '@/lib/components/section/MCard.vue'
import MSectionHeader from '@/lib/components/section/MSectionHeader.vue'
import MAlert from '@/lib/components/status/MAlert.vue'
import MAsyncState from '@/lib/components/status/MAsyncState.vue'
import MEmptyState from '@/lib/components/status/MEmptyState.vue'

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
