<template>
  <div
    ref="field"
    :class="[
      'field',
      {
        focused,
        populated,
        disabled,
        readonly,
        invalid: invalidState,
        multiline,
        'has-label': hasLabel,
        'not-ready': !ready,
      },
    ]"
    :data-size="size"
    :data-variant="variant"
    :title="title"
  >
    <div ref="container" class="container" @pointerdown="onPointerDown">
      <div class="area">
        <div v-if="slots.leading" ref="leading" v-resize="updateLabelInlineStart" class="leading">
          <slot name="leading" />
        </div>
        <div v-if="prefix" class="prefix">{{ prefix }}</div>
        <div class="control"><slot /></div>
        <div v-if="suffix" class="suffix">{{ suffix }}</div>
        <div v-if="slots.trailing" class="trailing"><slot name="trailing" /></div>
      </div>

      <label v-if="hasLabel" :for="id">
        <slot name="label">{{ label }}</slot>
      </label>

      <fieldset aria-hidden="true" class="outline">
        <legend v-if="hasLabel">
          <slot name="label">{{ label }}</slot>
        </legend>
      </fieldset>
    </div>

    <div v-if="slots.error || error || slots.hint || hint || slots.counter" class="supporting">
      <div v-if="slots.error || error || slots.hint || hint" class="messages">
        <div v-if="slots.error || error" :id="`${id}-error`" class="error">
          <slot name="error">{{ error }}</slot>
        </div>

        <div v-if="slots.hint || hint" :id="`${id}-hint`" class="hint">
          <slot name="hint">{{ hint }}</slot>
        </div>
      </div>

      <div v-if="slots.counter" class="counter"><slot name="counter" /></div>
    </div>
  </div>
</template>

<script lang="ts">
export type FieldFrameExpose = {
  field: HTMLDivElement | null
  container: HTMLDivElement | null
}
</script>

<script lang="ts" setup>
import { computed, onMounted, ref, useSlots, useTemplateRef } from 'vue'

import { interactiveSelector as fieldInteractiveSelector, type MFieldProperties } from './mfield.shared'

type Properties = MFieldProperties

const {
  id,
  focused,
  populated,
  disabled = false,
  readonly = false,
  invalid = false,
  multiline = false,
  label = '',
  error = '',
  variant = 'outlined',
  size = 'medium',
} = defineProps<Properties>()
const fieldReference = useTemplateRef<HTMLDivElement>('field')
const containerReference = useTemplateRef<HTMLDivElement>('container')
const leadingReference = useTemplateRef<HTMLDivElement>('leading')

const slots = useSlots()
const emit = defineEmits<{
  'request-focus': []
  ready: []
}>()
const ready = ref(false)
const hasLabel = computed((): boolean => label !== '' || slots.label !== undefined)
const hasError = computed((): boolean => error !== '' || slots.error !== undefined)
const invalidState = computed((): boolean => invalid || hasError.value)

defineExpose<FieldFrameExpose>({
  get field() {
    return fieldReference.value
  },
  get container() {
    return containerReference.value
  },
})

const onPointerDown = (event: PointerEvent): void => {
  if (disabled || event.button !== 0) return

  const target = event.target
  if (!(target instanceof Element) || target.closest(fieldInteractiveSelector)) return
  if (event.pointerType === 'mouse') event.preventDefault()

  emit('request-focus')
}

const setLabelInlineStart = (value: string): void => {
  if (!fieldReference.value) return
  fieldReference.value.style.setProperty('--label-inline-start', value)
}

const updateLabelInlineStart = (): void => {
  if (!fieldReference.value) return
  if (!slots.leading || !leadingReference.value) {
    setLabelInlineStart('0px')
    return
  }

  const width = leadingReference.value.getBoundingClientRect().width
  setLabelInlineStart(`calc(var(--gap-x) + ${width}px)`)
}

onMounted(() => {
  updateLabelInlineStart()
  requestAnimationFrame(() => {
    ready.value = true
    emit('ready')
  })
})
</script>

<style scoped>
@layer components {
  .field,
  .field > div.container,
  .field > div.container > div.area {
    position: relative;
    min-inline-size: 0;
  }

  .field {
    --font-size: var(--font-size-md);
    --line-height: 1.5;
    --control-height: max(var(--touch-target-min), calc(3.5 * var(--font-size)));
    --gap-x: calc(var(--font-size) / 2);
    --gap-y: calc(var(--font-size) / 4);
    --padding-inline: var(--font-size);
    --border-width: 2px;
    --border-radius: var(--radius-md);
    --border-color: light-dark(var(--gray-300), var(--gray-600));
    --border-hover-color: light-dark(var(--gray-400), var(--gray-500));
    --border-active-color: var(--blue-500);
    --border-error-color: var(--red-500);
    --bg: transparent;
    --bg-hover: var(--bg);
    --text-color: light-dark(var(--gray-900), var(--gray-100));
    --label-color: light-dark(var(--gray-800), var(--gray-300));
    --label-active-color: light-dark(var(--blue-600), var(--blue-300));
    --error-color: var(--error-text-color);
    --details-font-size: calc(var(--font-size) * 0.875);
    --hint-color: var(--text-color-dimmed);
    --cursor: text;

    --label-color-current: var(--label-color);
    --label-font-size: var(--font-size);
    --label-font-size-active: calc(var(--font-size) * 0.875);
    --label-inline-start: 0px;
    --border-color-current: var(--border-color);
    --container-bg: var(--bg);
    --transition-duration: var(--duration-md);
    --transition-func: var(--bezier-smooth);
    --label-clearance: calc(var(--label-font-size-active) / 2 - var(--border-width) / 2);
    --filled-label-space: calc(var(--label-font-size-active) * 0.75);
    --filled-label-block-start: calc(var(--filled-label-space) / 2);
    --multiline-padding-block: calc(var(--padding-inline) * 0.75);
    --multiline-label-block-start: calc(var(--multiline-padding-block) + var(--font-size) * 0.75);
    --prefix-color: oklch(from var(--text-color) l c h / 0.5);
    --prefix-opacity: 0;
    --prefix-scale: 0.75;
    --opacity: 1;

    display: flex;
    flex-direction: column;
    row-gap: var(--gap-y);
    cursor: var(--cursor);
    opacity: var(--opacity);
    font-size: var(--font-size);

    &:is([data-variant='outlined']) {
      padding-block-start: var(--label-clearance);
    }

    &:is(.not-ready) {
      --transition-duration: 0s;
    }

    &:is([data-size='small']) {
      --control-height: max(var(--touch-target-min), calc(3 * var(--font-size)));
      --padding-inline: calc(var(--font-size) * 0.75);
    }

    &:is([data-variant='filled']) {
      --bg: color-mix(in oklch, var(--text-color) 6%, transparent);
      --bg-hover: color-mix(in oklch, var(--bg) 97%, var(--text-color) 3%);
      --filled-border-width: max(1px, calc(var(--border-width) / 2));
    }
  }

  .field > div.container {
    inset: 0;
    border-radius: var(--border-radius);
    background-color: var(--container-bg);

    transition: background-color var(--transition-duration) var(--transition-func);

    & > fieldset {
      position: absolute;
      inset: 0;
      min-inline-size: 0;
      pointer-events: none;
      border-width: var(--border-width);
      border-style: solid;
      border-color: var(--border-color-current);
      border-radius: var(--border-radius);

      transition: border-color var(--transition-duration) var(--transition-func);

      & > legend {
        --legend-inline-size: 0.01px;
        --legend-padding-inline: 0;

        block-size: 0;
        margin-inline-start: calc(var(--padding-inline) / 2 - var(--border-width));
        padding-inline: var(--legend-padding-inline);
        max-inline-size: var(--legend-inline-size);
        visibility: hidden;
        font-size: var(--label-font-size-active);

        transition-property: max-inline-size, padding-inline;
        transition-duration: var(--transition-duration);
        transition-timing-function: var(--transition-func);
      }
    }

    & > fieldset > legend,
    & > label {
      white-space: nowrap;
      text-overflow: ellipsis;
      pointer-events: none;
      user-select: none;
      line-height: 1.25;
    }

    & > label {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: calc(var(--padding-inline) + var(--label-inline-start));
      transform: translateY(calc(-50% + var(--border-width) / 2));
      transform-origin: left top;

      min-inline-size: 0;
      max-inline-size: calc(100% - var(--padding-inline) * 2 - var(--label-inline-start));
      overflow: hidden;
      color: var(--label-color-current);
      font-size: var(--label-font-size);

      transition-property: inset-block-start, inset-inline-start, color, font-size, transform;
      transition-duration: var(--transition-duration);
      transition-timing-function: var(--transition-func);
    }

    & > div.area {
      display: flex;
      align-items: center;
      column-gap: var(--gap-x);
      padding-inline: var(--padding-inline);
      color: var(--text-color);

      & > .leading,
      & > .prefix,
      & > .suffix,
      & > .trailing {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
      }

      & > .prefix,
      & > .suffix {
        max-inline-size: 40%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        opacity: var(--prefix-opacity);
        color: var(--prefix-color);
        transform: scale(var(--prefix-scale));

        transition-property: opacity, transform;
        transition-duration: var(--transition-duration);
        transition-timing-function: var(--transition-func);
      }

      & > .control {
        display: flex;
        flex: 1 1 0;
        align-items: center;
        align-self: stretch;
        min-inline-size: 0;
        inline-size: 0;
      }
    }
  }

  .field:is([data-variant='filled']) {
    & > div.container > fieldset {
      border-width: 0;
      border-block-end-width: var(--filled-border-width);
      border-radius: 0 0 var(--border-radius) var(--border-radius);

      & > legend {
        margin-inline-start: 0;
        padding-inline: 0;
        max-inline-size: 0;
      }
    }

    &:is(.has-label) > div.container > div.area {
      padding-block-start: var(--filled-label-space);
    }
  }

  .field > div.supporting {
    display: flex;
    align-items: flex-start;
    column-gap: var(--gap-x);
    min-inline-size: 0;
    font-size: var(--details-font-size);
    line-height: 1.25;

    & > .messages {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      row-gap: var(--gap-y);
      min-inline-size: 0;

      & > .hint {
        color: var(--hint-color);
      }

      & > .error {
        color: var(--error-color);
      }
    }

    & > .counter {
      flex: 0 0 auto;
      margin-inline-start: auto;
      color: var(--hint-color);
      white-space: nowrap;
    }
  }

  .field:is(.multiline) {
    & > div.container {
      & > label {
        inset-block-start: var(--multiline-label-block-start);
      }

      & > div.area {
        align-items: flex-start;
        padding-block: var(--multiline-padding-block);

        & > .control {
          align-items: flex-start;
        }
      }
    }

    &:is(.has-label):is([data-variant='filled']) > div.container > div.area {
      padding-block-start: calc(var(--multiline-padding-block) + var(--filled-label-space));
    }
  }

  .field:is(:hover):where(:not(.disabled, .readonly)) {
    --border-color-current: var(--border-hover-color);
    --container-bg: var(--bg-hover);
  }

  .field:is(.focused):where(:not(.disabled, .readonly)) {
    --border-color-current: var(--border-active-color);
    --filled-border-width: var(--border-width);
    --label-color-current: var(--label-active-color);
  }

  .field:is(.focused, .populated) {
    --prefix-opacity: 1;
    --prefix-scale: 1;
    --label-font-size: var(--label-font-size-active);

    & > div.container > fieldset > legend {
      --legend-inline-size: 100%;
      --legend-padding-inline: calc(var(--padding-inline) / 2);
    }

    & > div.container > label {
      --label-inline-start: 0px;
      inset-block-start: 0;
    }
  }

  .field:is(.has-label):is([data-variant='filled']):is(.focused, .populated) > div.container > label {
    inset-block-start: var(--filled-label-block-start);
    transform: none;
  }

  .field:is(.invalid) {
    --border-color-current: var(--border-error-color);
    --filled-border-width: var(--border-width);
    --label-color-current: var(--error-color);
  }

  .field:is(.readonly) {
    --opacity: 0.75;
    --cursor: default;
    user-select: text;
    caret-color: transparent;
  }

  .field:is(.disabled) {
    --opacity: 0.5;
    --cursor: not-allowed;
    user-select: none;

    & > .container {
      pointer-events: none;
    }
  }
}
</style>
