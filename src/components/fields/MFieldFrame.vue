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
        invalid: invalid || Boolean(error || slots.error),
        multiline,
        'not-ready': !ready,
      },
    ]"
    :title="title"
  >
    <div ref="container" class="container" @pointerdown="onPointerDown">
      <div class="area">
        <div v-if="slots.leading" ref="leading" class="leading"><slot name="leading" /></div>
        <div v-if="prefix" class="prefix">{{ prefix }}</div>
        <div class="control"><slot /></div>
        <div v-if="suffix" class="suffix">{{ suffix }}</div>
        <div v-if="slots.trailing" class="trailing"><slot name="trailing" /></div>
      </div>

      <label v-if="slots.label || label" :for="id">
        <slot name="label">{{ label }}</slot>
      </label>

      <fieldset aria-hidden="true" class="outline">
        <legend v-if="slots.label || label">
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
export type MFieldFrameExpose = {
  field: HTMLDivElement | null
  container: HTMLDivElement | null
}
</script>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, useSlots, useTemplateRef } from 'vue'

import { interactiveSelector, type MFieldProperties } from './mfield.shared'

const {
  id,
  focused,
  populated,
  disabled = false,
  readonly = false,
  multiline = false,
} = defineProps<MFieldProperties>()
const fieldReference = useTemplateRef<HTMLDivElement>('field')
const containerReference = useTemplateRef<HTMLDivElement>('container')
const leadingReference = useTemplateRef<HTMLDivElement>('leading')

const slots = useSlots()
const emit = defineEmits<{
  'request-focus': []
  ready: []
}>()
const ready = ref(false)

const fieldInteractiveSelector = `${interactiveSelector}, textarea`

defineExpose<MFieldFrameExpose>({
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
  setLabelInlineStart(`calc(var(--input-gap-x) + ${width}px)`)
}

let leadingObserver: ResizeObserver | undefined
onMounted(() => {
  updateLabelInlineStart()

  if (leadingReference.value) {
    leadingObserver = new ResizeObserver(updateLabelInlineStart)
    leadingObserver.observe(leadingReference.value)
  }

  requestAnimationFrame(() => {
    ready.value = true
    emit('ready')
  })
})

onBeforeUnmount(() => {
  leadingObserver?.disconnect()
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
    --cursor: text;
    --field-gap-y: calc(var(--input-font-size) / 4);
    --label-color: var(--input-label-color);
    --label-font-size: var(--input-font-size);
    --label-font-size-active: calc(var(--input-font-size) * 0.875);
    --label-inline-start: 0px;
    --border-color: var(--input-border-color);
    --transition-duration: var(--duration-md);
    --transition-func: var(--bezier-smooth);
    --field-label-clearance: 0;

    --multiline-padding-block: calc(var(--input-padding-inline) * 0.75);
    --multiline-label-block-start: calc(var(--multiline-padding-block) + var(--input-font-size) * 0.75);

    --prefix-color: oklch(from var(--input-text-color) l c h / 0.5);
    --prefix-opacity: 0;
    --prefix-scale: 0.75;

    --opacity: 1;

    display: flex;
    flex-direction: column;
    row-gap: var(--field-gap-y);
    cursor: var(--cursor);
    opacity: var(--opacity);
    padding-block-start: var(--field-label-clearance);

    &:is(.not-ready) {
      --transition-duration: 0s;
    }
  }

  .field > div.container {
    inset: 0;

    & > fieldset {
      position: absolute;
      inset: 0;
      min-inline-size: 0;
      pointer-events: none;
      border-width: var(--input-border-width);
      border-style: solid;
      border-color: var(--border-color);
      border-radius: var(--input-border-radius);

      transition: border-color var(--transition-duration) var(--transition-func);

      & > legend {
        --inline-size: 0.01px;
        --padding-inline: 0;
        block-size: 0;
        margin-inline-start: calc(var(--input-padding-inline) / 2 - var(--input-border-width));
        padding-inline: var(--padding-inline);
        max-inline-size: var(--inline-size);
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
    }

    & > label {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: calc(var(--input-padding-inline) + var(--label-inline-start));
      transform: translateY(-50%);
      transform-origin: left top;

      min-inline-size: 0;
      max-inline-size: calc(100% - var(--input-padding-inline) * 2 - var(--label-inline-start));
      overflow: hidden;
      color: var(--label-color);
      font-size: var(--label-font-size);

      transition-property: inset-block-start, inset-inline-start, color, font-size, transform;
      transition-duration: var(--transition-duration);
      transition-timing-function: var(--transition-func);
    }

    & > div.area {
      display: flex;
      align-items: center;
      column-gap: var(--input-gap-x);
      padding-inline: var(--input-padding-inline);
      color: var(--input-text-color);

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

  .field > div.supporting {
    display: flex;
    align-items: flex-start;
    column-gap: var(--input-gap-x);
    min-inline-size: 0;
    font-size: calc(var(--input-font-size) * 0.875);
    line-height: 1.25;

    & > .messages {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      row-gap: var(--field-gap-y);
      min-inline-size: 0;

      & > .hint {
        color: var(--input-hint-color);
      }

      & > .error {
        color: var(--input-error-color);
      }
    }

    & > .counter {
      flex: 0 0 auto;
      margin-inline-start: auto;
      color: var(--input-hint-color);
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
  }

  .field:is(:hover):where(:not(.disabled, .readonly)) {
    --border-color: var(--input-border-hover-color);
  }

  .field:is(.focused):where(:not(.disabled, .readonly)) {
    --border-color: var(--input-border-active-color);
    --label-color: var(--input-label-active-color);
  }

  .field:is(.focused, .populated) {
    --prefix-opacity: 1;
    --prefix-scale: 1;
    --label-font-size: calc(var(--input-font-size) * 0.875);

    & > div.container > fieldset > legend {
      --inline-size: 100%;
      --padding-inline: calc(var(--input-padding-inline) / 2);
    }

    & > div.container > label {
      --label-inline-start: 0px;
      inset-block-start: 0;
    }
  }

  .field:is(.invalid) {
    --border-color: var(--input-border-error-color);
    --label-color: var(--input-error-color);
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
