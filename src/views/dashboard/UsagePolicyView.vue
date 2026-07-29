<template>
  <MFormGrid :columns="1">
    <MCaption>Usage Policy</MCaption>

    <MFormGrid :columns="1">
      <MCard>
        <MTextarea
          v-model="usagePolicy"
          :maxlength="1000"
          :rows="10"
          counter
          hint="Usage policy for the device"
          label="Usage Policy"
        >
          <template #leading>
            <MIcon :icon="ScaleIcon" style="--color: var(--green-500)" />
          </template>
          <template #counter="{ length, maxlength }">
            <template v-if="maxlength">{{ maxlength - length }} remaining</template>
          </template>
        </MTextarea>
      </MCard>
    </MFormGrid>

    <div class="actions">
      <MButton><MIcon :icon="CheckIcon" /> Save </MButton>
    </div>
  </MFormGrid>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CheckIcon } from '@lucide/vue'
import { ScaleIcon } from '@lucide/vue'

import MButton from '@/components/buttons/MButton.vue'
import MTextarea from '@/components/fields/MTextarea.vue'
import MFormGrid from '@/components/grid/MFormGrid.vue'
import MIcon from '@/components/MIcon.vue'
import MCaption from '@/components/section/MCaption.vue'
import MCard from '@/components/section/MCard.vue'

const usagePolicy =
  ref(`This system is for the use of authorized users only. Individuals using this system without authority, or in excess of their authority, are subject to having all their activities on this system monitored and recorded by system personnel.

Anyone using this system expressly consents to such monitoring and is advised that if such monitoring reveals possible evidence of criminal activity, system personnel may provide the evidence of such monitoring to law enforcement officials.`)
</script>
