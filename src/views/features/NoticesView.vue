<template>
  <div style="display: grid; gap: 1rem">
    <div v-for="type in ['neutral', 'info', 'warning', 'danger']" :key="type">
      <MNotice :type>
        {{ type }}. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum provident accusamus cumque
        dolore cum neque eligendi laudantium, reprehenderit, delectus sequi fuga officiis adipisci consectetur maxime
        numquam temporibus, vitae veritatis ut.
      </MNotice>
    </div>

    <div v-for="type in ['neutral', 'info', 'warning', 'danger']" :key="type">
      <MNotice :icon="false" :type>{{ type }}</MNotice>
    </div>

    <div v-for="type in ['neutral', 'info', 'warning', 'danger']" :key="type">
      <MNotice :type>
        {{ type }}. Custom icon.
        <template #icon>
          <MIcon :icon="LockKeyholeOpenIcon" />
        </template>
        <template #actions>
          <MButton kind="neutral" size="small">Action</MButton>
        </template>
      </MNotice>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LockKeyholeOpenIcon } from '@lucide/vue'

import MButton from '@/components/buttons/MButton.vue'
import MIcon from '@/components/MIcon.vue'
import MNotice from '@/components/misc/MNotice.vue'
</script>
