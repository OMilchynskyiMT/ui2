<template>
  <div class="form-input">
    <div ref="control" class="control">
      <div v-if="slots.before" ref="before" class="before"><slot name="before" /></div>
      <div class="field">
        <label v-if="slots.default || label" :for="id" :title="title">
          <slot>{{ label }}</slot>
        </label>
        <input :id="id" v-bind="attrs" :placeholder="''" :type="type" />
      </div>
      <div v-if="slots.after" class="after"><slot name="after" /></div>
    </div>

    <div a="1" b="2" c="3" />

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, useAttrs, useSlots, useTemplateRef } from 'vue'

import { type BaseFormControlProps, generateHtmlId } from '@/components/form/shared'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const {
  id = generateHtmlId(),
  label,
  title = '',
  type = 'text',
  error,
} = defineProps<
  BaseFormControlProps & {
    type?: HTMLInputElement['type']
  }
>()

const controlRef = useTemplateRef('control')
const beforeRef = useTemplateRef('before')

let observer: ResizeObserver | null = null
const updateBeforeWidth = () => {
  const width = beforeRef.value?.offsetWidth ?? 0
  controlRef.value?.style.setProperty('--before-width', `${width}px`)
}

onMounted(() => {
  updateBeforeWidth()
  observer = new ResizeObserver(updateBeforeWidth)
  if (beforeRef.value) {
    observer.observe(beforeRef.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.form-input {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.form-input > .control {
  --gap: var(--input-gap);
  --bg: var(--input-bg);

  display: flex;
  gap: var(--gap);
  align-items: center;
  height: var(--input-height);
  border: var(--input-border-width) solid var(--border-color, var(--input-border-color));
  border-radius: var(--input-border-radius);
  padding-inline: var(--gap);
  background-color: var(--bg);
  opacity: var(--input-opacity, 1);
  cursor: var(--input-cursor, text);

  transition-property: border-color;
  transition-duration: var(--duration-md);

  &:hover {
    --border-color: var(--input-border-hover-color);
  }

  & > .before,
  & > .after,
  & > .field,
  & > .field > input {
    height: 100%;
  }

  & > .before,
  & > .after {
    display: grid;
    place-items: center;
    flex: none;
    user-select: none;
  }

  & > .field {
    position: relative;
    flex: 1;

    & > label {
      position: absolute;
      top: calc(-1.5 * var(--input-border-width));
      left: 0;
      transform: translate(var(--label-translate-x, 0), var(--label-translate-y, calc(var(--input-height) / 3)));
      font-size: var(--label-font-size, 1rem);
      background-color: var(--label-bg, transparent);
      color: var(--label-color, var(--input-label-color));
      padding-inline: var(--padding, 0);
      user-select: none;
      cursor: var(--input-cursor);
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;

      transition:
        transform var(--duration-lg),
        color var(--duration-md),
        padding-inline var(--duration-md),
        background-color var(--duration-xs) var(--duration-sm),
        font-size var(--duration-md);
      transition-timing-function: var(--bezier-magnetic);
    }

    & > input {
      width: 100%;
      border: none;
      color: var(--input-text-color);
      font-size: var(--input-font-size);
      background-color: transparent;
      cursor: var(--input-cursor);
    }
  }

  &:focus-within {
    --border-color: var(--input-border-active-color);
  }

  &:focus-within,
  &:has(input:not(:placeholder-shown)) {
    --padding: calc(var(--gap) / 2);
    --label-translate-y: -50%;
    --label-translate-x: calc(-1 * var(--gap) / 2);
    --label-bg: var(--surface-bg);
    --label-color: var(--input-label-active-color);
    --label-font-size: var(--font-size-sm);
  }

  &:has(> .before) {
    &:focus-within,
    &:has(input:not(:placeholder-shown)) {
      --label-translate-x: calc(-1 * (var(--before-width, 0) + var(--gap) + var(--gap) / 2));
    }
  }

  &:has(input:disabled) {
    --input-opacity: 0.6;
    --border-color: var(--input-border-color);
    --input-cursor: not-allowed;
  }
}

.form-input:has(.error) > .control {
  --border-color: var(--input-border-error-color);
}

.form-input > .error {
  color: var(--input-error-color);
  font-size: var(--input-error-font-size);
}
</style>