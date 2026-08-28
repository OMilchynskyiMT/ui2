<template>
  <MTextField v-model="model" :invalid="!isHexColorValid(model)">
    <template v-for="name in Object.keys(slots).filter(name => !reservedSlots.includes(name))" #[name]>
      <slot :name="name" />
    </template>

    <template #leading>
      <input ref="colorInput" v-model="model" type="color" />
      <button aria-label="Choose color" class="color-picker" type="button" @click="colorInput?.click()">
        <MIcon :icon="PaletteIcon" />
      </button>
    </template>
  </MTextField>
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

import MIcon from '@/lib/components/MIcon.vue'

import MTextField from './MTextField.vue'

const slots = useSlots()
const model = defineModel<string>({ required: true })
const colorInput = useTemplateRef<HTMLInputElement>('colorInput')
</script>

<style scoped>
@layer components {
  .field {
    --target-color: v-bind(model);

    input[type='color'] {
      position: absolute;
      visibility: hidden;
    }
  }

  .color-picker {
    display: inline-grid;
    place-items: center;
    padding: var(--input-border-width);
    border: 0;
    border-radius: var(--input-border-radius);
    background-color: var(--target-color);
    cursor: pointer;

    & > .icon {
      --color: contrast-color(var(--target-color));
    }
  }
}
</style>
