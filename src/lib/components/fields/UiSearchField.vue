<template>
  <UiTextField
    :id="id"
    ref="field"
    v-model="model"
    v-bind="attributes"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    :invalid="invalid"
    :label="label"
    :lazy="lazy"
    :placeholder="placeholder"
    :prefix="prefix"
    :readonly="readonly"
    :size="size"
    :suffix="suffix"
    :title="title"
    :variant="variant"
    enterkeyhint="search"
    type="search"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
    @focus="emit('focus', $event)"
    @input="emit('input', $event)"
  >
    <template #leading>
      <slot name="leading">
        <UiIcon :icon="SearchIcon" aria-hidden="true" />
      </slot>
    </template>

    <template v-if="slots.trailing || (clearable && model !== '')" #trailing>
      <span class="search-actions">
        <slot name="trailing" />
        <UiButton
          v-if="clearable && model !== ''"
          :aria-controls="id"
          :aria-label="clearLabel"
          :disabled="disabled || readonly"
          :title="clearLabel"
          layout="icon"
          size="small"
          tone="neutral"
          type="button"
          variant="text"
          @click="clear"
        >
          <template #leading><UiIcon :icon="XIcon" aria-hidden="true" /></template>
        </UiButton>
      </span>
    </template>

    <template v-for="name in forwardedSlots" #[name]>
      <slot :name="name" />
    </template>
  </UiTextField>
</template>

<script lang="ts">
import type { UiTextFieldProperties } from './UiTextField.vue'

export type UiSearchFieldProperties = Omit<UiTextFieldProperties, 'type'> & {
  clearable?: boolean
  clearLabel?: string
}
</script>

<script lang="ts" setup>
import { computed, useAttrs, useSlots, useTemplateRef } from 'vue'
import { SearchIcon, XIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'

import UiButton from '../buttons/UiButton.vue'
import { getForwardedSlotNames } from '../component.shared'
import UiIcon from '../UiIcon.vue'
import { createFieldExpose, type UiFieldExpose } from './field.shared'
import UiTextField from './UiTextField.vue'

defineOptions({
  inheritAttrs: false,
})

const {
  id = useId(),
  readonly = false,
  disabled = false,
  label = 'Search',
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
  clearable = true,
  clearLabel = 'Clear search',
} = defineProps<UiSearchFieldProperties>()

const emit = defineEmits<{
  input: [event: InputEvent]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
}>()

const model = defineModel<string>({ required: true })
const attributes = useAttrs()
const slots = useSlots()
const fieldReference = useTemplateRef<UiFieldExpose>('field')
const forwardedSlots = computed(() => getForwardedSlotNames(slots, ['default', 'leading', 'trailing']))

const clear = (): void => {
  if (disabled || readonly) return

  model.value = ''
  fieldReference.value?.focus()
  emit('clear')
}

defineExpose<UiFieldExpose>(createFieldExpose(() => fieldReference.value))
</script>

<style scoped>
@layer components {
  .search-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  :deep(input[type='search']::-webkit-search-cancel-button) {
    appearance: none;
  }
}
</style>
