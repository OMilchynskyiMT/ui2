<template>
  <button
    :aria-label="label"
    :class="{ copied }"
    :disabled
    class="copy"
    title="Copy to clipboard"
    type="button"
    @click="copy"
  >
    <span class="icon-frame">
      <UiIcon :icon="CheckIcon" class="check" color="var(--copy-button-color)" size="var(--copy-button-icon-size)" />
      <UiIcon :icon="CopyIcon" class="copy" color="var(--copy-button-color)" size="var(--copy-button-icon-size)" />
    </span>
    <slot :copied>{{ label ?? '' }}</slot>
  </button>
</template>

<script lang="ts">
type Properties = {
  text: string
  label?: string
  resetAfter?: number
  disabled?: boolean
}

type Slots = {
  default?: (properties: { copied: boolean }) => unknown
}

type Events = {
  copied: [text: string]
  error: [error: unknown]
}
</script>

<script lang="ts" setup>
import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { CheckIcon, CopyIcon } from '@lucide/vue'

import UiIcon from '../UiIcon.vue'

const { text, label = 'Copy', resetAfter = 2500, disabled = false } = defineProps<Properties>()

const copied = ref(false)
const resetTimer = shallowRef<number>()

const emit = defineEmits<Events>()
defineSlots<Slots>()

const copy = async (): Promise<void> => {
  if (disabled) return

  try {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API is not available')
    }
    await navigator.clipboard.writeText(text)
  } catch (error) {
    emit('error', error)
    return
  }

  copied.value = true
  emit('copied', text)
  clearResetTimer()

  if (resetAfter > 0) {
    resetTimer.value = setTimeout(() => {
      copied.value = false
      resetTimer.value = undefined
    }, resetAfter)
  }
}

const clearResetTimer = (): void => {
  if (resetTimer.value === undefined) return
  clearTimeout(resetTimer.value)
  resetTimer.value = undefined
}

onBeforeUnmount(clearResetTimer)
</script>

<style scoped>
@layer components {
  button.copy {
    /* Public CSS customization hook. */
    --copy-button-color: var(--copy-accent-color);
    --outline-border-color: transparent;
    --outline-bg: transparent;
    --cover-width: 100%;
    --cover-height: 100%;
    --feedback-shadow-color: transparent;
    --copy-button-icon-size: 1.25em;
    --copy-button-disabled-opacity: 0.5;

    -webkit-tap-highlight-color: var(--outline-bg);
    position: relative;
    display: inline-flex;
    min-inline-size: 0;
    align-items: center;
    justify-content: center;
    column-gap: var(--space-xs);
    vertical-align: middle;
    cursor: pointer;

    &:disabled {
      cursor: default;
      opacity: var(--copy-button-disabled-opacity);
    }

    & > span.icon-frame {
      flex: 0 0 var(--copy-button-icon-size);
      inline-size: var(--copy-button-icon-size);
      block-size: var(--copy-button-icon-size);
      display: grid;
      place-items: center;
      line-height: 0;

      & > svg.icon {
        grid-area: 1 / 1;

        transition-property: stroke-opacity;
        transition-duration: var(--duration-lg);
        transition-timing-function: var(--bezier-smooth);
      }

      & > svg.icon.copy {
        stroke-opacity: 1;
      }

      & > svg.icon.check {
        stroke-opacity: 0;
      }
    }

    &::after {
      content: '';
      display: block;
      position: absolute;
      width: var(--cover-width);
      height: var(--cover-height);
      border-radius: var(--radius-full);
      box-shadow: 0 4px 8px -2px var(--feedback-shadow-color);
      background-color: var(--outline-bg);
      border: var(--border-width-thin) solid var(--outline-border-color);

      inset-block-start: 50%;
      inset-inline-start: 50%;
      translate: -50% -50%;
      pointer-events: none;

      transition-property: box-shadow, width, height, background-color, border-color;
      transition-duration: var(--duration-lg);
      transition-timing-function: var(--bezier-emphasized);
    }

    &:focus-visible {
      --outline-bg: oklch(from var(--copy-button-color) l c h / 0.08);
      --outline-border-color: oklch(from var(--copy-button-color) l c h / 0.24);
    }

    &.copied {
      --outline-bg: oklch(from var(--copy-button-color) l c h / 0.1);
      --outline-border-color: oklch(from var(--copy-button-color) l c h / 0.2);
      --feedback-shadow-color: var(--shadow-color-key);
      --cover-width: calc(100% + var(--space-sm));
      --cover-height: calc(100% + var(--space-xs));

      & > span.icon-frame {
        & > svg.icon.copy {
          stroke-opacity: 0;
        }

        & > svg.icon.check {
          stroke-opacity: 1;
        }
      }
    }

    @media (prefers-reduced-motion: reduce) {
      &::after {
        transition: none;
      }
    }
  }
}
</style>
