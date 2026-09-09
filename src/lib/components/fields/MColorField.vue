<template>
  <MTextField
    :id="id"
    ref="field"
    v-model="model"
    v-bind="attributes"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    :invalid="isInvalid"
    :label="label"
    :lazy="lazy"
    :placeholder="placeholder"
    :prefix="prefix"
    :readonly="readonly"
    :size="size"
    :suffix="suffix"
    :title="title"
    :variant="variant"
    type="text"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
    @focus="emit('focus', $event)"
    @input="emit('input', $event)"
  >
    <template #leading>
      <span class="color-actions">
        <slot name="leading" />

        <span :class="{ disabled: disabled || readonly }" class="color-picker">
          <span aria-hidden="true" class="swatch">
            <MIcon :icon="PaletteIcon" />
          </span>

          <input
            :aria-label="pickerLabel"
            :disabled="disabled || readonly"
            :title="pickerLabel"
            :value="pickerColor"
            class="native-color-input"
            type="color"
            @change="onPickerChange"
            @input="onPickerInput"
          />
        </span>
      </span>
    </template>

    <template v-if="slots.trailing" #trailing>
      <slot name="trailing" />
    </template>

    <template v-for="name in forwardedSlots" #[name]>
      <slot :name="name" />
    </template>
  </MTextField>
</template>

<script lang="ts">
import type { MTextFieldProperties } from './MTextField.vue'

export type MColorFieldProperties = Omit<MTextFieldProperties, 'type'> & {
  pickerLabel?: string
}

export const isHexColorValid = (color: string): boolean => {
  return /^#(?:[A-Fa-f\d]{3}|[A-Fa-f\d]{6})$/.test(color)
}

export const normalizeHexColor = (color: string, fallback = '#000000'): string => {
  if (!isHexColorValid(color)) return fallback
  if (color.length === 7) return color

  const red = color.charAt(1)
  const green = color.charAt(2)
  const blue = color.charAt(3)
  return `#${red}${red}${green}${green}${blue}${blue}`
}
</script>

<script lang="ts" setup>
import { computed, useAttrs, useSlots, useTemplateRef } from 'vue'
import { PaletteIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'

import MIcon from '../MIcon.vue'
import MTextField, { type MFieldExpose } from './MTextField.vue'

defineOptions({
  inheritAttrs: false,
})

const {
  id = useId(),
  readonly = false,
  disabled = false,
  label = '',
  title,
  prefix = '',
  suffix = '',
  error = '',
  invalid = false,
  hint = '',
  lazy = false,
  placeholder = '',
  variant = 'outlined',
  size = 'medium',
  pickerLabel = 'Choose color',
} = defineProps<MColorFieldProperties>()

const emit = defineEmits<{
  input: [event: InputEvent]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const model = defineModel<string>({ required: true })
const attributes = useAttrs()
const slots = useSlots()
const fieldReference = useTemplateRef<MFieldExpose>('field')
const syntaxInvalid = computed((): boolean => model.value !== '' && !isHexColorValid(model.value))
const isInvalid = computed((): boolean => invalid === true || syntaxInvalid.value)
const pickerColor = computed(() => normalizeHexColor(model.value))
const forwardedSlots = computed(() =>
  Object.keys(slots).filter(name => name !== 'default' && name !== 'leading' && name !== 'trailing')
)

const updateFromPicker = (event: Event): void => {
  model.value = (event.currentTarget as HTMLInputElement).value
}

const onPickerInput = (event: Event): void => {
  updateFromPicker(event)
  emit('input', event as InputEvent)
}

const onPickerChange = (event: Event): void => {
  updateFromPicker(event)
  emit('change', event)
}

defineExpose<MFieldExpose>({
  focus: options => fieldReference.value?.focus(options),
  blur: () => fieldReference.value?.blur(),
  select: () => fieldReference.value?.select(),
})
</script>

<style scoped>
@layer components {
  .color-actions {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .color-picker {
    position: relative;
    display: inline-grid;
    place-items: center;
    padding: var(--space-xxs);
    border-radius: var(--radius-md);
    cursor: pointer;

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .native-color-input {
    position: absolute;
    z-index: 1;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    opacity: 0;
    cursor: inherit;
  }

  .swatch {
    --swatch-color: v-bind(pickerColor);

    display: inline-grid;
    place-items: center;
    inline-size: 1.75rem;
    block-size: 1.75rem;
    pointer-events: none;
    border: 1px solid color-mix(in oklch, var(--text-color) 20%, transparent);
    border-radius: var(--radius-md);
    background: var(--swatch-color);

    & > .icon {
      --size: 1rem;
      --color: contrast-color(var(--swatch-color));
    }
  }
}
</style>
