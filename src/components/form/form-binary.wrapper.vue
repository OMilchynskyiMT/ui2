<template>
  <div
    v-bind="rootAttributes"
    :class="[rootAttributes.class, { 'has-error': Boolean(error) }]"
    :data-variant="variant"
    class="form-binary"
  >
    <label :for="id" :title="title" class="control">
      <div v-if="slots.before" class="before"><slot name="before" /></div>

      <div class="main">
        <input :id="id" v-bind="inputAttributes" :checked="checked" :type="type" @change="change" />
        <span aria-hidden="true" class="indicator">
          <slot name="indicator" />
        </span>

        <span v-if="slots.default || label" class="label">
          <slot>{{ label }}</slot>
        </span>
      </div>

      <div v-if="slots.after" class="after"><slot name="after" /></div>
    </label>

    <form-error :error="error" />
  </div>
</template>

<script lang="ts" setup>
import { computed, useAttrs, useSlots } from 'vue'

import FormError from '@/components/form/form-error.vue'
import { type BaseFormControlProperties, generateHtmlId } from '@/components/form/shared'

defineOptions({ inheritAttrs: false })
const slots = useSlots()
const attributes = useAttrs()
const model = defineModel<boolean | string | number | null>()

const rootAttributes = computed(() => ({
  class: attributes.class,
  style: attributes.style,
}))

const inputAttributes = computed(() => {
  const { class: _class, style: _style, ...rest } = attributes
  return rest
})

const {
  id = generateHtmlId(),
  label,
  title = '',
  type = 'checkbox',
  variant = 'checkbox',
  error,
} = defineProps<
  BaseFormControlProperties & {
    type?: 'checkbox' | 'radio'
    variant?: 'checkbox' | 'radio' | 'toggle'
    error?: string
  }
>()

const inputValue = computed(() => inputAttributes.value.value as string | number | undefined)

const checked = computed(() => {
  if (type === 'radio') {
    return model.value === inputValue.value || Boolean(inputAttributes.value.checked)
  }

  if (typeof model.value === 'boolean') {
    return model.value
  }

  return Boolean(inputAttributes.value.checked)
})

const change = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (type === 'radio') {
    if (target.checked) {
      model.value = inputValue.value ?? target.value
    }
    return
  }

  model.value = target.checked
}
</script>

<style scoped>
.form-binary {
  --gap: calc(var(--input-gap) / 1.5);
  display: grid;
  gap: var(--gap);

  & > .control {
    display: flex;
    align-items: center;
    gap: calc(var(--gap) * 6);

    & > .before,
    & > .after {
      flex: none;
      display: grid;
      place-items: center;
      user-select: none;
    }

    & > .main {
      display: inline-flex;
      align-items: center;
      gap: var(--gap);
      min-width: 0;
      cursor: pointer;

      &:has(> input:disabled) {
        cursor: not-allowed;
        opacity: 0.72;
      }

      & > input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      & > .indicator {
        flex: none;
        display: grid;
        place-items: center;
        position: relative;
        will-change: border-color, background-color, opacity, box-shadow;
        transition:
          border-color var(--duration-md),
          background-color var(--duration-md),
          opacity var(--duration-md),
          box-shadow var(--duration-md);
        transition-timing-function: var(--bezier-magnetic);
      }

      & > input:focus-visible + .indicator {
        box-shadow: 0 0 0 var(--input-ring-width) color-mix(in oklch, var(--input-border-active-color) 20%, transparent);
      }

      & > .label {
        min-width: 0;
        color: var(--input-label-color);
        line-height: 1.35;
        user-select: none;
      }
    }
  }
}
</style>
