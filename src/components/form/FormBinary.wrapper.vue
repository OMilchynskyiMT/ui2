<template>
  <div
    :class="[{ 'has-error': error }, rootAttrs.class]"
    :data-variant="variant"
    v-bind="rootAttrs"
    class="form-binary"
  >
    <div class="control">
      <div v-if="slots.before" class="before"><slot name="before" /></div>

      <label :for="id" :title="title" class="main">
        <input :id="id" :type="type" v-bind="inputAttrs" />
        <span class="indicator" aria-hidden="true">
          <slot name="indicator" />
        </span>

        <span v-if="slots.default || label" class="label">
          <slot>{{ label }}</slot>
        </span>
      </label>

      <div v-if="slots.after" class="after"><slot name="after" /></div>
    </div>

    <FormError :error="error" />
  </div>
</template>

<script lang="ts" setup>
import { computed, useAttrs, useSlots } from 'vue'

import FormError from '@/components/form/FormError.vue'
import { type BaseFormControlProps, generateHtmlId } from '@/components/form/shared'

defineOptions({ inheritAttrs: false })
const slots = useSlots()
const attrs = useAttrs()

const rootAttrs = computed(() => ({
  class: attrs.class,
  style: attrs.style,
}))

const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const {
  id = generateHtmlId(),
  label,
  title = '',
  type = 'checkbox',
  variant = 'checkbox',
  error = undefined,
} = defineProps<
  BaseFormControlProps & {
    type?: 'checkbox' | 'radio'
    variant?: 'checkbox' | 'radio' | 'toggle'
    error?: string
  }
>()
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
