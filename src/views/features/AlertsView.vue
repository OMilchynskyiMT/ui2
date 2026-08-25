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
          <MButton tone="neutral" size="small">Action</MButton>
        </template>
      </MAlert>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LockKeyholeOpenIcon } from '@lucide/vue'

import MButton from '@/lib/components/buttons/MButton.vue'
import type { FeedbackTone } from '@/lib/components/component.types'
import MAlert from '@/lib/components/feedback/MAlert.vue'
import MIcon from '@/lib/components/MIcon.vue'

const tones: FeedbackTone[] = ['neutral', 'info', 'success', 'warning', 'danger']
</script>
