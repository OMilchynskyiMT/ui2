<template>
  <MTextField
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
        <MIcon :icon="SearchIcon" aria-hidden="true" />
      </slot>
    </template>

    <template v-if="slots.trailing || (clearable && model !== '')" #trailing>
      <span class="search-actions">
        <slot name="trailing" />
        <MButton
          v-if="clearable && model !== ''"
          :aria-controls="id"
          :aria-label="clearLabel"
          :disabled="disabled || readonly"
          :title="clearLabel"
          size="small"
          tone="neutral"
          type="button"
          variant="icon"
          @click="clear"
        >
          <MIcon :icon="XIcon" aria-hidden="true" />
        </MButton>
      </span>
    </template>

    <template v-for="name in forwardedSlots" #[name]>
      <slot :name="name" />
    </template>
  </MTextField>
</template>

<script lang="ts">
import type { MTextFieldProperties } from './MTextField.vue'

export type MSearchFieldProperties = Omit<MTextFieldProperties, 'type'> & {
  clearable?: boolean
  clearLabel?: string
}
</script>

<script lang="ts" setup>
import { computed, useAttrs, useSlots, useTemplateRef } from 'vue'
import { SearchIcon, XIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'

import MButton from '../buttons/MButton.vue'
import { getForwardedSlotNames } from '../component.shared'
import MIcon from '../MIcon.vue'
import { createFieldExpose, type MFieldExpose } from './mfield.shared'
import MTextField from './MTextField.vue'

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
} = defineProps<MSearchFieldProperties>()

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
const fieldReference = useTemplateRef<MFieldExpose>('field')
const forwardedSlots = computed(() => getForwardedSlotNames(slots, ['default', 'leading', 'trailing']))

const clear = (): void => {
  if (disabled || readonly) return

  model.value = ''
  fieldReference.value?.focus()
  emit('clear')
}

defineExpose<MFieldExpose>(createFieldExpose(() => fieldReference.value))
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
