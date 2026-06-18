<template>
  <MField v-model="model" :invalid="!isHexColorValid(model)">
    <template v-for="name in Object.keys(slots).filter(name => !reservedSlots.includes(name))" #[name]>
      <slot :name="name" />
    </template>

    <template #leading>
      <input ref="colorInput" v-model="model" type="color" />
      <button @click="colorInput?.click()"><MIcon ref="paletteIcon" :icon="PaletteIcon" /></button>
    </template>
  </MField>
</template>

<script lang="ts">
export const reservedSlots = ['leading']

export const isHexColorValid = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}
</script>

<script lang="ts" setup>
import { useSlots, useTemplateRef } from 'vue'
import { PaletteIcon } from '@lucide/vue'

import MIcon from '@/components/MIcon.vue'

import MField from './MField.vue'

const slots = useSlots()
const model = defineModel<string>({ required: true })
const colorInput = useTemplateRef<HTMLInputElement>('colorInput')
</script>

<style scoped>
.field {
  --target-color: v-bind(model);

  & .leading {
    & button {
      border: none;
      background-color: var(--target-color);
      padding: var(--input-border-width);
      display: inline-flex;
      place-items: center;
      border-radius: var(--input-border-radius);

      & .icon {
        --color: contrast-color(var(--target-color));
        cursor: pointer;
      }
    }
  }

  input[type='color'] {
    position: absolute;
    visibility: hidden;
  }
}
</style>
