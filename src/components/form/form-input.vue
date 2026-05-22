<template>
  <form-input-wrapper :id="id" :error="error" :label="label" :style="containerStyle" :title="title">
    <template v-if="slots.before" #before><slot name="before" /></template>
    <template v-if="slots.default || label" #label>
      <slot>{{ label }}</slot>
    </template>
    <input :id="id" v-bind="attributes" :type="type" :value="inputValue" placeholder=" " @input="input" />
    <template v-if="slots.after" #after><slot name="after" /></template>
  </form-input-wrapper>
</template>

<script lang="ts" setup>
import { computed, useAttrs, useSlots } from 'vue'

import FormInputWrapper from '@/components/form/form-input.wrapper.vue'
import { type BaseFormControlProperties, generateHtmlId } from '@/components/form/shared'

defineOptions({ inheritAttrs: false })
const attributes = useAttrs()
const slots = useSlots()
const model = defineModel<string | number>()
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

const inputValue = computed(() => model.value ?? (attributes.value as string | number | undefined) ?? '')

const input = (event: Event) => {
  model.value = (event.target as HTMLInputElement).value
}
</script>
