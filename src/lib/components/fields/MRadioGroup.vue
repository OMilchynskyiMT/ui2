<template>
  <fieldset
    :id="id"
    :aria-describedby="description"
    :aria-errormessage="isInvalid && hasError ? `${id}-error` : undefined"
    :aria-invalid="isInvalid || undefined"
    :class="{ disabled, invalid: isInvalid, readonly }"
    :data-orientation="orientation"
    :disabled="disabled"
    class="radio-group"
  >
    <legend v-if="label || slots.label">
      <slot name="label">{{ label }}</slot>
    </legend>

    <div class="options">
      <MRadio
        v-for="(option, index) in options"
        :id="option.id ?? `${id}-option-${index}`"
        :key="option.id ?? `${index}-${String(option.value)}`"
        v-model="model"
        :disabled="disabled || option.disabled"
        :hint="option.hint"
        :invalid="isInvalid"
        :label="option.label"
        :name="resolvedName"
        :readonly="readonly"
        :title="option.title"
        :value="option.value"
        @blur="emit('blur', $event)"
        @change="emit('change', $event)"
        @focus="emit('focus', $event)"
      />
    </div>

    <div v-if="hasError || hasHint" class="supporting">
      <div v-if="hasError" :id="`${id}-error`" class="error">
        <slot name="error">{{ error }}</slot>
      </div>
      <div v-if="hasHint" :id="`${id}-hint`" class="hint">
        <slot name="hint">{{ hint }}</slot>
      </div>
    </div>
  </fieldset>
</template>

<script lang="ts">
import type { RadioValue } from './MRadio.vue'

export type MRadioGroupOrientation = 'horizontal' | 'vertical'

export type MRadioGroupOption<V extends RadioValue> = {
  value: V
  label: string
  id?: string
  title?: string
  hint?: string
  disabled?: boolean
}

export type MRadioGroupProperties<V extends RadioValue> = {
  options: readonly MRadioGroupOption<V>[]
  id?: string
  name?: string
  label?: string
  hint?: string
  error?: string
  invalid?: boolean
  disabled?: boolean
  readonly?: boolean
  orientation?: MRadioGroupOrientation
}
</script>

<script generic="V extends RadioValue" lang="ts" setup>
import { computed, useSlots } from 'vue'

import { useId } from '@/composables/useId'

import MRadio from './MRadio.vue'

const {
  options,
  id = useId('m-radio-group-'),
  name,
  label = '',
  hint = '',
  error = '',
  invalid = false,
  disabled = false,
  readonly = false,
  orientation = 'vertical',
} = defineProps<MRadioGroupProperties<V>>()

const emit = defineEmits<{
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const model = defineModel<V>({ required: true })
const slots = useSlots()
const resolvedName = computed(() => name ?? id)
const hasError = computed(() => Boolean(error || slots.error))
const hasHint = computed(() => Boolean(hint || slots.hint))
const isInvalid = computed(() => invalid || hasError.value)
const description = computed(() => {
  const identifiers: string[] = []
  if (hasError.value) identifiers.push(`${id}-error`)
  if (hasHint.value) identifiers.push(`${id}-hint`)
  return identifiers.length > 0 ? identifiers.join(' ') : undefined
})
</script>

<style scoped>
@layer components {
  .radio-group {
    --group-gap: var(--space-md);
    --group-option-gap: var(--space-lg);
    --group-label-color: var(--input-label-color);
    --group-hint-color: var(--input-hint-color);
    --group-error-color: var(--input-error-color);
    --group-details-font-size: var(--input-error-font-size);

    min-inline-size: 0;
    display: grid;
    gap: var(--group-gap);
    margin: 0;
    padding: 0;
    border: 0;

    & > legend {
      padding: 0;
      color: var(--group-label-color);
      font-size: var(--input-font-size);
      font-weight: var(--font-weight-semibold);
    }

    & > .options {
      min-inline-size: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--group-option-gap);
    }

    &[data-orientation='horizontal'] > .options {
      flex-flow: row wrap;
      align-items: flex-start;
    }

    & > .supporting {
      display: grid;
      gap: var(--space-xxs);
      font-size: var(--group-details-font-size);

      & > .error {
        color: var(--group-error-color);
      }

      & > .hint {
        color: var(--group-hint-color);
      }
    }

    &.invalid {
      --group-label-color: var(--input-error-color);
    }

    &.disabled > :is(legend, .supporting) {
      opacity: 0.5;
    }
  }
}
</style>
