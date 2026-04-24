<template>
  <form-input-wrapper :id="id" :error="error" :label="label" :title="title">
    <template v-if="slots.before" #before><slot name="before" /></template>
    <template v-if="slots.default || label" #label>
      <slot>{{ label }}</slot>
    </template>

    <input
      :id="id"
      v-bind="attributes"
      role="combobox"
      :aria-activedescendant="activeOptionId"
      :aria-controls="optionsId"
      :aria-expanded="opened"
      :value="query"
      autocomplete="off"
      placeholder=" "
      type="text"
      @blur="close"
      @focus="open"
      @input="input"
      @keydown.down.prevent="move(1)"
      @keydown.enter="enter"
      @keydown.esc="close"
      @keydown.up.prevent="move(-1)"
    />

    <template v-if="slots.after" #after><slot name="after" /></template>

    <template #options>
      <div v-if="opened && filteredOptions.length > 0" :id="optionsId" role="listbox" class="form-combo-options">
        <button
          v-for="(option, index) in filteredOptions"
          :id="getOptionId(index)"
          :key="option.value"
          role="option"
          :aria-selected="activeIndex === index"
          :class="{ active: activeIndex === index }"
          :disabled="option.disabled"
          class="form-combo-option"
          type="button"
          @mousedown.prevent="select(option)"
        >
          <slot name="option" :option="option">
            <header class="title">{{ option.title }}</header>
            <p class="value">{{ option.value }}</p>
          </slot>
        </button>
      </div>
    </template>
  </form-input-wrapper>
</template>

<script lang="ts" setup>
import { computed, ref, useAttrs, useSlots, watch } from 'vue'

import FormInputWrapper from '@/components/form/form-input.wrapper.vue'
import {
  type BaseFormControlProperties,
  type FormComboInputOption,
  type FormComboInputValue,
  generateHtmlId,
  normalizeFormComboInputOption,
} from '@/components/form/shared'

defineOptions({ inheritAttrs: false })
const attributes = useAttrs()
const slots = useSlots()
const model = defineModel<FormComboInputValue>()

const {
  id = generateHtmlId(),
  label,
  title = '',
  error,
  options = [],
} = defineProps<
  BaseFormControlProperties & {
    options?: FormComboInputOption[]
  }
>()

const optionsId = `${id}-options`
const opened = ref(false)
const query = ref('')
const activeIndex = ref(-1)

const normalizedOptions = computed(() => options.map(element => normalizeFormComboInputOption(element)))
const selectedOption = computed(() => normalizedOptions.value.find(option => option.value === model.value))
const filteredOptions = computed(() => {
  const value = query.value.trim().toLowerCase()

  if (!value) {
    return normalizedOptions.value
  }

  return normalizedOptions.value.filter(option => option.title.toLowerCase().includes(value))
})

const activeOptionId = computed(() => (activeIndex.value === -1 ? undefined : getOptionId(activeIndex.value)))
const firstEnabledOptionIndex = computed(() => filteredOptions.value.findIndex(option => !option.disabled))

const getOptionId = (index: number) => `${optionsId}-${index}`
const syncQuery = () => {
  query.value = selectedOption.value?.title ?? String(model.value ?? '')
}
const open = () => {
  if (filteredOptions.value.length === 0) {
    return
  }

  opened.value = true
  activeIndex.value = firstEnabledOptionIndex.value
}
const close = () => {
  opened.value = false
  activeIndex.value = -1
}
const input = (event: Event) => {
  const target = event.target as HTMLInputElement
  query.value = target.value
  model.value = target.value
  open()
}
const move = (direction: 1 | -1) => {
  if (!opened.value) {
    open()
    return
  }

  const options = filteredOptions.value
  if (options.length === 0) {
    return
  }

  let index = activeIndex.value
  for (const _ of Array.from({ length: options.length })) {
    index = (index + direction + options.length) % options.length
    if (!options[index]?.disabled) {
      activeIndex.value = index
      return
    }
  }
}
const select = (option: (typeof filteredOptions.value)[number]) => {
  if (option.disabled) {
    return
  }

  model.value = option.value
  query.value = option.title
  close()
}
const enter = (event: KeyboardEvent) => {
  const option = filteredOptions.value[activeIndex.value]

  if (!opened.value || !option) {
    return
  }

  event.preventDefault()
  select(option)
}

watch(() => model.value, syncQuery, { immediate: true })
watch(filteredOptions, () => {
  activeIndex.value = firstEnabledOptionIndex.value
})
</script>

<style>
.form-combo-options {
  position: absolute;
  z-index: 1;
  inset-inline: 0;
  top: calc(var(--input-height) + var(--input-gap) / 3);
  display: grid;
  max-height: calc(var(--font-size) * 14);
  overflow: auto;
  border: var(--input-border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  background-color: var(--input-bg);
  box-shadow: var(--shadow-md);
  opacity: 1;
  transform: translateY(0);

  will-change: opacity, transform;
  transition-behavior: allow-discrete;
  transition-property: opacity, transform;
  transition-duration: var(--duration-md);
  transition-timing-function: var(--bezier-smooth-entrance);

  & > .form-combo-option {
    border: none;
    padding: calc(var(--input-gap) / 1.5) var(--input-gap);
    color: var(--input-text-color);
    font: inherit;
    text-align: start;
    background-color: transparent;
    cursor: pointer;

    &:hover,
    &.active {
      background-color: color-mix(in oklch, var(--input-border-active-color) 12%, transparent);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    & > .title {
      font-weight: bold;
    }

    & > .value {
      color: var(--text-color-dimmed);
      font-size: var(--font-size-sm);
    }
  }
}

@starting-style {
  .form-combo-options {
    opacity: 0;
    transform: translateY(-1rem);
  }
}
</style>