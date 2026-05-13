<template>
  <form-input-wrapper :id="id" :error="error" :label="label" :style="containerStyle" :title="title">
    <template v-if="slots.before" #before><slot name="before" /></template>
    <template v-if="slots.default || label" #label>
      <slot>{{ label }}</slot>
    </template>
    <input :id="id" v-bind="attributes" :type="type" placeholder=" " />
    <template v-if="slots.after" #after><slot name="after" /></template>
  </form-input-wrapper>
</template>

<script lang="ts" setup>
import { useAttrs, useSlots } from 'vue'

import FormInputWrapper from '@/components/form/form-input.wrapper.vue'
import { type BaseFormControlProperties, generateHtmlId } from '@/components/form/shared'

defineOptions({ inheritAttrs: false })
const attributes = useAttrs()
const slots = useSlots()
const {
  id = generateHtmlId(),
  label,
  title = '',
  type = 'text',
  error,
  containerStyle,
} = defineProps<
  BaseFormControlProperties & {
    type?: HTMLInputElement['type']
  }
>()
</script>
