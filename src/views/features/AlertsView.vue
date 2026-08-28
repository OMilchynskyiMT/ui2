<template>
  <div style="display: grid; gap: 1rem">
    <div v-for="tone in tones" :key="`default-${tone}`">
      <MAlert :tone>
        {{ tone }}. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum provident accusamus cumque
        dolore cum neque eligendi laudantium, reprehenderit, delectus sequi fuga officiis adipisci consectetur maxime
        numquam temporibus, vitae veritatis ut.
      </MAlert>
    </div>

    <div v-for="tone in tones" :key="`no-icon-${tone}`">
      <MAlert :icon="false" :tone>{{ tone }}</MAlert>
    </div>

    <div v-for="tone in tones" :key="`custom-${tone}`">
      <MAlert :tone>
        {{ tone }}. Custom icon.
        <template #icon>
          <MIcon :icon="LockKeyholeOpenIcon" />
        </template>
        <template #actions>
          <MButton size="small" tone="neutral">Action</MButton>
        </template>
      </MAlert>
    </div>

    <section class="states">
      <h2>Async state</h2>

      <div>
        <MAsyncState loading />
      </div>

      <div>
        <MAsyncState :error="demoError" />
      </div>

      <div>
        <MAsyncState empty>
          <template #empty>
            <MEmptyState :icon="InboxIcon" description="There are no items to display yet." title="Nothing here">
              <template #actions>
                <MButton variant="tonal">Create item</MButton>
              </template>
            </MEmptyState>
          </template>
        </MAsyncState>
      </div>

      <div>
        <MAsyncState>
          <MAlert tone="success">Content is ready.</MAlert>
        </MAsyncState>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { InboxIcon, LockKeyholeOpenIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import type { FeedbackTone } from '@/lib/components/component.types'
import MIcon from '@/lib/components/MIcon.vue'
import MAlert from '@/lib/components/status/MAlert.vue'
import MAsyncState from '@/lib/components/status/MAsyncState.vue'
import MEmptyState from '@/lib/components/status/MEmptyState.vue'

const tones: FeedbackTone[] = ['neutral', 'info', 'success', 'warning', 'danger']
const demoError = new Error('Unable to load data')
</script>

<style scoped>
.states {
  display: grid;
  gap: var(--space-md);

  & > div {
    min-block-size: 8rem;
    border: 1px solid var(--divider-color);
    border-radius: var(--radius-md);
  }
}
</style>
