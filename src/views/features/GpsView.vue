<template>
  <UiStack gap="var(--space-xl)">
    <UiSectionHeader description="Offline WGS84 position overview with valid, unavailable, and no-fix states">
      GPS position
    </UiSectionHeader>

    <UiCluster>
      <UiButton variant="outlined" @click="setPosition(50.4501, 30.5234)">Kyiv</UiButton>
      <UiButton variant="outlined" @click="setPosition(-33.8688, 151.2093)">Sydney</UiButton>
      <UiButton variant="outlined" @click="setPosition(0, 0)">Null Island</UiButton>
      <UiButton variant="outlined" @click="setPosition(0, 180)">Date line</UiButton>
      <UiButton variant="outlined" @click="hasFix = false">No fix</UiButton>
      <UiButton variant="outlined" @click="setPosition(120, 10)">Invalid latitude</UiButton>
    </UiCluster>

    <UiCard>
      <UiStack gap="var(--space-lg)">
        <UiCluster gap="var(--space-lg)">
          <UiNumberField v-model="latitude" :max="90" :min="-90" class="coordinate-field" label="Latitude" prefix="N" />
          <UiNumberField
            v-model="longitude"
            :max="180"
            :min="-180"
            class="coordinate-field"
            label="Longitude"
            prefix="E"
          />
          <UiSwitch v-model="hasFix" label="GPS fix" />
        </UiCluster>
        <GpsPositionMap :has-fix="hasFix" :position="position" />
      </UiStack>
    </UiCard>
  </UiStack>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import UiButton from '@/lib/components/buttons/UiButton.vue'
import UiNumberField from '@/lib/components/fields/UiNumberField.vue'
import UiSwitch from '@/lib/components/fields/UiSwitch.vue'
import UiCluster from '@/lib/components/layout/UiCluster.vue'
import UiStack from '@/lib/components/layout/UiStack.vue'
import UiCard from '@/lib/components/section/UiCard.vue'
import UiSectionHeader from '@/lib/components/section/UiSectionHeader.vue'
import GpsPositionMap from '@/components/gps/GpsPositionMap.vue'

const latitude = ref<number | null>(50.4501)
const longitude = ref<number | null>(30.5234)
const hasFix = ref(true)
const position = computed(() =>
  latitude.value !== null && longitude.value !== null ? { lat: latitude.value, lng: longitude.value } : null
)

const setPosition = (lat: number, lng: number): void => {
  latitude.value = lat
  longitude.value = lng
  hasFix.value = true
}
</script>

<style scoped>
@layer components {
  .coordinate-field {
    flex: 1 1 14rem;
    max-inline-size: 20rem;
  }
}
</style>
