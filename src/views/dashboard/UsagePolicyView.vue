<template>
  <UiFormGrid :columns="1">
    <UiSectionHeader>Usage Policy</UiSectionHeader>

    <UiFormGrid :columns="1">
      <UiCard>
        <UiTextarea
          v-model="usagePolicy"
          :maxlength="1000"
          :rows="10"
          counter
          hint="Usage policy for the device"
          label="Usage Policy"
        >
          <template #leading>
            <UiIcon :icon="ScaleIcon" style="--color: var(--green-500)" />
          </template>
          <template #counter="{ length, maxlength }">
            <template v-if="maxlength">{{ maxlength - length }} remaining</template>
          </template>
        </UiTextarea>
      </UiCard>
    </UiFormGrid>

    <UiBottomActions adaptive>
      <UiButton>
        <template #leading><UiIcon :icon="CheckIcon" /></template>
        Save
      </UiButton>
    </UiBottomActions>
  </UiFormGrid>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CheckIcon } from '@lucide/vue'
import { ScaleIcon } from '@lucide/vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiTextarea from '@/lib/components/fields/UiTextarea.vue'
import UiFormGrid from '@/lib/components/grid/UiFormGrid.vue'
import UiBottomActions from '@/lib/components/layout/UiBottomActions.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import UiIcon from '@/lib/components/UiIcon.vue'

const usagePolicy =
  ref(`This system is for the use of authorized users only. Individuals using this system without authority, or in excess of their authority, are subject to having all their activities on this system monitored and recorded by system personnel.

Anyone using this system expressly consents to such monitoring and is advised that if such monitoring reveals possible evidence of criminal activity, system personnel may provide the evidence of such monitoring to law enforcement officials.`)
</script>
