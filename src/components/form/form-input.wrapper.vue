<template>
  <div class="form-input">
    <fieldset>
      <legend>
        <span v-if="slots.label || label" role="label">
          <slot name="label">{{ label }}</slot>
        </span>
      </legend>
      <label ref="control" :for="id" :title="title" class="control">
        <div v-if="slots.before" ref="before" class="before"><slot name="before" /></div>
        <div class="field">
          <span v-if="slots.label || label" role="label">
            <slot name="label">{{ label }}</slot>
          </span>
          <slot />
        </div>
        <div v-if="slots.after" class="after"><slot name="after" /></div>
      </label>
    </fieldset>

    <slot name="options" />

    <form-error :error="error" />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, useSlots, useTemplateRef } from 'vue'

import FormError from '@/components/form/form-error.vue'
import { type BaseFormControlProperties, generateHtmlId } from '@/components/form/shared'

const slots = useSlots()
const { id = generateHtmlId(), label, title = '', error } = defineProps<BaseFormControlProperties>()

const controlReference = useTemplateRef('control')
const beforeReference = useTemplateRef('before')

let observer: ResizeObserver | undefined
const updateBeforeWidth = () => {
  const width = beforeReference.value?.offsetWidth ?? 0
  controlReference.value?.style.setProperty('--before-width', `${width}px`)
}

onMounted(() => {
  updateBeforeWidth()
  observer = new ResizeObserver(updateBeforeWidth)
  if (beforeReference.value) {
    observer.observe(beforeReference.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style>
.form-input {
  --gap: var(--input-gap);
  --bg: var(--input-bg);

  --label-padding: 0;
  --legend-width: 0;

  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.form-input > fieldset {
  border: var(--input-border-width) solid var(--border-color, var(--input-border-color));
  border-radius: var(--input-border-radius);
  inset: 0;
  margin: 0;
  min-inline-size: 0;
  transition-property: border-color;
  transition-duration: var(--duration-lg);

  & > legend {
    line-height: 0;
    height: 0;
    margin-left: calc(var(--gap) / 2);
    padding-inline: var(--label-padding);
    width: var(--legend-width);
    visibility: hidden;
    font-size: var(--label-font-size, 0);
    will-change: width, padding-inline;
    transition-property: width, padding-inline;
    transition-duration: var(--duration-xl);
  }

  &:focus-within {
    --border-color: var(--input-border-active-color);
  }

  &:focus-within,
  &:has(input:not(:placeholder-shown)) {
    --legend-width: auto;
    --label-font-size: var(--font-size-sm);
    --label-padding: calc(var(--gap) / 2);
    --label-translate-y: -50%;
    --label-translate-x: calc(-1 * var(--gap) / 2);
    --label-color: var(--input-label-active-color);
  }
}

.form-input > fieldset > .control {
  display: flex;
  gap: var(--gap);
  align-items: center;
  height: var(--input-height);
  padding-inline: var(--gap);
  background-color: var(--bg);
  opacity: var(--input-opacity, 1);
  cursor: var(--input-cursor, text);

  will-change: border-color, opacity;
  transition-property: border-color, opacity;
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

    & > [role='label'] {
      position: absolute;
      top: calc(-1 * var(--input-border-width));
      left: 0;
      transform: translate(var(--label-translate-x, 0), var(--label-translate-y, calc(var(--input-height) / 3)));
      font-size: var(--label-font-size, 1rem);
      color: var(--label-color, var(--input-label-color));
      padding-inline: var(--label-padding, 0);
      user-select: none;
      cursor: var(--input-cursor);
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;

      will-change: transform, color, font-size;
      transition: transform, color, font-size;
      transition-duration: var(--duration, var(--duration-lg));
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

.form-input:has(.error) > fieldset {
  --border-color: var(--input-border-error-color);
}
</style>