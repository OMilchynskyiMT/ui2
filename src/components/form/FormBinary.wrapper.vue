<template>
  <div :class="{ 'has-error': !!error }" class="form-binary">
    <div class="control">
      <div v-if="slots.before" class="before"><slot name="before" /></div>

      <label :for="id" :title="title" class="main">
        <input :id="id" v-bind="attrs" :role="role" type="checkbox" />
        <slot name="indicator" />
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
import { useAttrs, useSlots } from 'vue'

import FormError from '@/components/form/FormError.vue'
import { type BaseFormControlProps, generateHtmlId } from '@/components/form/shared'

const slots = useSlots()
const attrs = useAttrs()

const {
  id = generateHtmlId(),
  label,
  title = '',
  role = 'checkbox',
  error = undefined,
} = defineProps<
  BaseFormControlProps & {
    role?: string
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