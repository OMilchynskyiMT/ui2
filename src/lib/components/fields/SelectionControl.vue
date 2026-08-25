<template>
  <label
    :class="[
      'selection-control',
      variant,
      {
        checked,
        disabled,
        readonly,
        invalid: isInvalid,
        indeterminate,
        'icon-only': !hasBody,
      },
      rootClass,
    ]"
    :style="rootStyle"
    :title="title"
  >
    <input
      :id="id"
      ref="input"
      v-bind="inputAttributes"
      :aria-describedby="describedBy"
      :aria-disabled="disabled"
      :aria-errormessage="hasError ? `${id}-error` : undefined"
      :aria-invalid="isInvalid || undefined"
      :aria-readonly="readonly || undefined"
      :checked="checked"
      :disabled="disabled"
      :role="role"
      :type="type"
      :value="value"
      class="input"
      @blur="emit('blur', $event)"
      @change="onChange"
      @click="onClick"
      @focus="emit('focus', $event)"
    />

    <span aria-hidden="true" class="indicator" />

    <span v-if="hasBody" class="body">
      <span v-if="slots.default || label" class="label">
        <slot>{{ label }}</slot>
      </span>

      <span v-if="slots.error || error" :id="`${id}-error`" class="error">
        <slot name="error">{{ error }}</slot>
      </span>

      <span v-if="slots.hint || hint" :id="`${id}-hint`" class="hint">
        <slot name="hint">{{ hint }}</slot>
      </span>
    </span>
  </label>
</template>

<script lang="ts">
export type SelectionControlVariant = 'checkbox' | 'radio' | 'toggle'

export type SelectionControlProperties = {
  id?: string
  type: 'checkbox' | 'radio'
  variant: SelectionControlVariant
  checked?: boolean
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  indeterminate?: boolean
  label?: string
  hint?: string
  error?: string
  title?: string
  role?: string
  value?: string
}

export type SelectionControlExpose = {
  focus: (options?: FocusOptions) => void
  blur: () => void
}
</script>

<script lang="ts" setup>
import { computed, useAttrs, useId, useSlots, useTemplateRef, watchEffect } from 'vue'

const {
  id = useId(),
  checked = false,
  disabled = false,
  readonly = false,
  invalid = false,
  indeterminate = false,
  label = '',
  hint = '',
  error = '',
  title,
  role,
  value,
} = defineProps<SelectionControlProperties>()

const emit = defineEmits<{
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const slots = useSlots()
const attributes = useAttrs()
const inputReference = useTemplateRef<HTMLInputElement>('input')

defineOptions({
  inheritAttrs: false,
})

const rootClass = computed(() => attributes.class)
const rootStyle = computed(() => attributes.style)

const inputAttributes = computed(() => {
  const { class: _class, style: _style, ...rest } = attributes
  return rest
})

const hasError = computed(() => Boolean(error || slots.error))
const isInvalid = computed(() => invalid || hasError.value)
const hasHint = computed(() => Boolean(hint || slots.hint))
const hasBody = computed(() => label !== '' || Boolean(slots.default) || hasError.value || hasHint.value)
const describedBy = computed(() => {
  const ids: string[] = []

  if (hasError.value) ids.push(`${id}-error`)
  if (hasHint.value) ids.push(`${id}-hint`)

  return ids.length > 0 ? ids.join(' ') : undefined
})

watchEffect(() => {
  if (inputReference.value) {
    inputReference.value.indeterminate = indeterminate
  }
})

const onClick = (event: MouseEvent): void => {
  if (!readonly) return

  event.preventDefault()
}

const onChange = (event: Event): void => {
  if (readonly) {
    const input = event.currentTarget as HTMLInputElement
    input.checked = checked
    input.indeterminate = indeterminate
    return
  }

  emit('change', event)
}

defineExpose<SelectionControlExpose>({
  focus: (options?: FocusOptions) => inputReference.value?.focus(options),
  blur: () => inputReference.value?.blur(),
})
</script>

<style scoped>
@layer components {
  .selection-control {
    --control-color: var(--input-border-active-color);
    --control-container-color: var(--input-border-color);
    --control-container-hover-color: color-mix(in srgb, var(--control-container-color) 90%, currentColor);
    --control-error-color: var(--input-border-error-color);
    --control-mark-color: var(--surface-bg);
    --control-text-color: var(--input-text-color);
    --control-hint-color: var(--input-hint-color);
    --control-error-text-color: var(--input-error-color);
    --control-font-size: var(--input-font-size);
    --control-details-font-size: var(--input-error-font-size);
    --control-gap: var(--input-gap-x);
    --control-size: 1.25rem;
    --control-inline-size: var(--control-size);
    --control-block-size: var(--control-size);
    --control-radius: var(--radius-sm);
    --control-mark-width: max(2px, calc(var(--control-size) * 0.15));
    --control-align-offset: max(
      0px,
      calc((var(--control-font-size) * var(--line-height) - var(--control-block-size)) / 2)
    );
    --control-opacity: 1;
    --control-cursor: pointer;
    --control-transition-duration: var(--duration-md);
    --control-transition-func: var(--bezier-magnetic);
    --control-indicator-bg: var(--control-container-color);

    position: relative;
    display: inline-grid;
    grid-template-columns: var(--control-inline-size) minmax(0, 1fr);
    grid-template-areas: 'indicator body';
    align-items: start;
    column-gap: var(--control-gap);
    min-inline-size: 0;
    color: var(--control-text-color);
    font-size: var(--control-font-size);
    line-height: var(--line-height);
    cursor: var(--control-cursor);
    opacity: var(--control-opacity);
    user-select: none;
    vertical-align: top;

    & > .indicator {
      grid-area: indicator;
      position: relative;
      display: block;
      overflow: clip;
      inline-size: var(--control-inline-size);
      block-size: var(--control-block-size);
      margin-block-start: var(--control-align-offset);
      background-color: var(--control-indicator-bg);
      color: var(--control-color);

      transition-property: background-color, color, box-shadow, transform;
      transition-duration: var(--control-transition-duration);
      transition-timing-function: var(--control-transition-func);

      &::after {
        content: '';
        position: absolute;
        display: block;

        transition-property: background-color, border-color, opacity, transform;
        transition-duration: var(--control-transition-duration);
        transition-timing-function: var(--control-transition-func);
      }
    }

    & > .input {
      position: absolute;
      z-index: 1;
      inset-block-start: var(--control-align-offset);
      inset-inline-start: 0;
      inline-size: var(--control-inline-size);
      block-size: var(--control-block-size);
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }

    &.checkbox {
      & > .indicator {
        border-radius: var(--control-radius);

        &::after {
          inset-block-start: 50%;
          inset-inline-start: 50%;
          inline-size: calc(var(--control-size) * 0.35);
          block-size: calc(var(--control-size) * 0.7);
          border-block-end: var(--control-mark-width) solid var(--control-mark-color);
          border-inline-end: var(--control-mark-width) solid var(--control-mark-color);
          opacity: 0;
          transform: translate(-50%, -100%) rotate(90deg) scale(0.33);
        }
      }

      &:has(.input:checked) > .indicator::after {
        opacity: 1;
        transform: translate(-50%, -60%) rotate(45deg) scale(1);
      }

      &:has(.input:indeterminate) > .indicator::after {
        inset-block-start: 50%;
        inset-inline-start: 50%;
        inline-size: calc(var(--control-size) * 0.54);
        block-size: var(--control-mark-width);
        border: 0;
        background-color: var(--control-mark-color);
        opacity: 1;
        transform: translate(-50%, -50%) scaleX(1);
      }
    }

    &.radio {
      --control-radius: var(--radius-full);

      & > .indicator {
        border-radius: var(--control-radius);

        &::after {
          inset-block-start: 50%;
          inset-inline-start: 50%;
          inline-size: calc(var(--control-size) * 0.5);
          block-size: calc(var(--control-size) * 0.5);
          border-radius: inherit;
          background-color: var(--control-mark-color);
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.4);
        }
      }

      &:has(.input:checked) > .indicator::after {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    &.toggle {
      --control-size: calc(var(--input-font-size) * 1.5);
      --control-height: var(--control-size);
      --control-width: calc(var(--control-height) * 1.9);
      --control-padding: var(--input-border-width);
      --control-thumb-size: calc(var(--control-height) - var(--control-padding) * 2);
      --control-inline-size: var(--control-width);
      --control-block-size: var(--control-height);
      --control-thumb-color: var(--surface-bg);
      --control-thumb-off-color: var(--surface-bg);
      --control-thumb-shadow: var(--shadow-xs);

      & > .indicator {
        border-radius: var(--radius-full);

        &::after {
          inset-block-start: var(--control-padding);
          inset-inline-start: var(--control-padding);
          inline-size: var(--control-thumb-size);
          block-size: var(--control-thumb-size);
          border-radius: var(--radius-full);
          background-color: var(--control-thumb-off-color);
          box-shadow: var(--control-thumb-shadow);
          transform: translateX(0);
        }
      }

      &:has(.input:checked) > .indicator::after {
        background-color: var(--control-thumb-color);
        transform: translateX(calc(var(--control-width) - var(--control-thumb-size) - var(--control-padding) * 2));
      }
    }

    & > .body {
      grid-area: body;
      min-inline-size: 0;

      & > .label,
      & > .hint,
      & > .error {
        display: block;
      }

      & > .label {
        min-inline-size: 0;
        overflow: hidden;
        color: var(--control-text-color);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      & > .hint,
      & > .error {
        margin-block-start: calc(var(--control-font-size) * 0.25);
        font-size: var(--control-details-font-size);
        line-height: 1.25;
      }

      & > .hint {
        color: var(--control-hint-color);
      }

      & > .error {
        color: var(--control-error-text-color);
      }
    }

    &.icon-only {
      grid-template-columns: var(--control-inline-size);
      grid-template-areas: 'indicator';
    }

    &.invalid {
      --control-color: var(--control-error-color);
    }

    &.disabled {
      --control-opacity: 0.5;
      --control-cursor: not-allowed;
    }

    &.readonly {
      --control-opacity: 0.75;
      --control-cursor: default;
    }

    &:where(:not(.disabled, .readonly)):hover {
      --control-indicator-bg: var(--control-container-hover-color);
      /* --control-indicator-bg: red; */
    }

    &:has(.input:checked) {
      --control-indicator-bg: var(--control-color);
    }

    &:has(.input:indeterminate) {
      --control-indicator-bg: oklch(from var(--control-color) l c h / 0.75);
    }
  }
}
</style>
