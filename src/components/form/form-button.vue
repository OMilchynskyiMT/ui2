<template>
  <component
    :is="component"
    v-ripple
    v-bind="rootAttributes"
    :aria-busy="loading || undefined"
    :class="[
      'app-button',
      attributes.class,
      {
        'is-block': block,
        'is-disabled': isDisabled,
      },
    ]"
    :data-icon-only="isIconOnly || undefined"
    :data-loading="loading || undefined"
    :data-size="size"
    :data-tone="tone"
    :data-variant="variant"
    :style="attributes.style"
    @click="click"
  >
    <span v-if="loading" class="loader" aria-hidden="true" />
    <span v-if="slots.before" class="before"><slot name="before" /></span>

    <span v-if="slots.default || label" class="label">
      <slot>{{ label }}</slot>
    </span>

    <span v-if="slots.after" class="after"><slot name="after" /></span>
  </component>
</template>

<script lang="ts" setup>
import { computed, useAttrs, useSlots } from 'vue'

type FormButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated'
type FormButtonTone = 'primary' | 'neutral' | 'danger'
type FormButtonSize = 'sm' | 'md' | 'lg'
type FormButtonType = 'button' | 'submit' | 'reset'

defineOptions({ inheritAttrs: false })
const attributes = useAttrs()
const slots = useSlots()

const {
  type = 'button',
  href,
  label,
  variant = 'filled',
  tone = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  block = false,
} = defineProps<{
  type?: FormButtonType
  href?: string
  label?: string
  variant?: FormButtonVariant
  tone?: FormButtonTone
  size?: FormButtonSize
  loading?: boolean
  disabled?: boolean
  block?: boolean
}>()

const component = computed(() => (href ? 'a' : 'button'))
const isDisabled = computed(() => disabled || loading)
const isIconOnly = computed(() => !slots.default && !label)

const rootAttributes = computed(() => {
  const { class: _class, style: _style, ...rest } = attributes

  if (href) {
    return {
      ...rest,
      href: isDisabled.value ? undefined : href,
      'aria-disabled': isDisabled.value || undefined,
      tabindex: isDisabled.value ? -1 : rest.tabindex,
    }
  }

  return {
    ...rest,
    type,
    disabled: isDisabled.value || undefined,
  }
})

const click = (event: MouseEvent) => {
  if (!isDisabled.value) {
    return
  }

  event.preventDefault()
  event.stopImmediatePropagation()
}
</script>

<style>
.app-button {
  --border-width: 0;
  --border-color: var(--button-color, transparent);

  --bg: transparent;
  --text-color: oklch(from var(--border-color) calc(l - 0.1) c h);
  --height: var(--button-height);
  --gap: calc(var(--input-gap) / 1.5);
  --padding-inline: calc(var(--input-gap) * 1.5);
  --border-radius: var(--button-border-radius);
  --font-size: var(--input-font-size);
  --shadow: none;
  --state-opacity: 0;

  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap);
  min-width: 4rem;
  height: var(--height);
  padding-inline: var(--padding-inline);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-color);
  background-color: var(--bg);
  box-shadow: var(--shadow);
  font: inherit;
  font-size: var(--font-size);
  font-weight: 600;
  line-height: 1;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  touch-action: manipulation;

  will-change: color, border-color, background-color, box-shadow, opacity;
  transition-property: color, border-color, background-color, box-shadow, opacity;
  transition-duration: var(--duration-md);
  transition-timing-function: var(--bezier-smooth-entrance);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    background-color: currentColor;
    opacity: var(--state-opacity);
    pointer-events: none;
    transition: opacity var(--duration-sm);
  }

  &:hover {
    --state-opacity: 0.04;
  }

  &:active {
    --state-opacity: 0.1;
  }

  & > .before,
  & > .after,
  & > .label {
    position: relative;
    z-index: 1;
  }

  & > .before,
  & > .after,
  & > .loader {
    flex: none;
    display: grid;
    place-items: center;
  }

  & > .label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & > .loader {
    position: absolute;
    min-width: 100%;
    min-height: 100%;
  }

  &:where(:disabled, .is-disabled, [aria-disabled='true']) {
    --state-opacity: 0;
    opacity: 0.72;
    box-shadow: none;
    cursor: not-allowed;
  }
}

.app-button[data-size='sm'] {
  --height: 2rem;
  --padding-inline: var(--input-gap);
  --font-size: var(--font-size-sm);
}

.app-button[data-size='lg'] {
  --height: calc(var(--input-height) * 1.5);
  --padding-inline: calc(var(--input-gap) * 2);
  --font-size: var(--font-size);
}

.app-button[data-icon-only='true'] {
  min-width: 0;
  width: var(--height);
  padding-inline: 0;
}

.app-button.is-block {
  width: 100%;
}

.app-button[data-tone='primary'] {
  --button-color: var(--button-primary-color);
}

.app-button[data-tone='neutral'] {
  --button-color: var(--button-neutral-color);
}

.app-button[data-tone='danger'] {
  --button-color: var(--button-danger-color);
}

.app-button[data-variant='filled'] {
  --bg: var(--button-color);
  --border-width: 0;
  --text-color: var(--white);
}

.app-button[data-variant='elevated'] {
  --bg: transparent;
  --border-width: var(--button-border-width);
  --border-color: transparent;
  --text-color: var(--button-color);
  --shadow: var(--shadow-md);
}

.app-button[data-variant='tonal'] {
  --bg: color-mix(in oklch, var(--button-color) 16%, transparent);
  --border-color: transparent;
  --border-width: var(--button-border-width);
  --text-color: var(--button-color);
}

.app-button[data-variant='outlined'] {
  --bg: transparent;
  --border-width: var(--input-border-width);
}

.app-button[data-variant='text'] {
  --bg: transparent;
  --border-color: transparent;
  --text-color: var(--button-color);
  --padding-inline: calc(var(--input-gap) / 1.5);
  min-width: 0;
}

@keyframes app-button-loader {
  to {
    transform: rotate(1turn);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-button {
    transition: none;

    &::before {
      transition: none;
    }

    & > .loader {
      animation: none;
    }
  }
}
</style>