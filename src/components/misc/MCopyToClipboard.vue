<template>
  <button
    :aria-label="label"
    :class="{ copied }"
    :data-direction="direction"
    :disabled
    class="copy"
    title="Copy to clipboard"
    type="button"
    @click="copy"
  >
    <slot :copied />
    <span class="icon-frame">
      <MIcon :icon="CheckIcon" class="check" />
      <MIcon :icon="CopyIcon" class="copy" />
    </span>
  </button>
</template>

<script lang="ts">
type Properties = {
  text: string
  label?: string
  resetAfter?: number
  disabled?: boolean
  direction?: 'ltr' | 'rtl'
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

import MIcon from '../MIcon.vue'

const { text, label = 'Copy', resetAfter = 2500, disabled = false, direction = 'ltr' } = defineProps<Properties>()

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
    --accent-color: var(--green-500);
    --outline-border-color: transparent;
    --outline-bg: transparent;
    --cover-width: 100%;
    --cover-height: 100%;
    --shadow-opacity: transparent;
    --icon-size: 1rem;

    appearance: none;
    -webkit-tap-highlight-color: var(--outline-bg);
    position: relative;
    display: inline-flex;
    min-inline-size: 0;
    align-items: center;
    justify-content: center;
    column-gap: var(--space-xs);
    cursor: pointer;

    &[data-direction='ltr'] {
      direction: ltr;
    }
    &[data-direction='rtl'] {
      direction: rtl;
    }

    &:disabled {
      cursor: default;
      opacity: var(--disabled-opacity);
    }

    & > span.icon-frame {
      flex: 0 0 var(--icon-size);
      inline-size: var(--icon-size);
      block-size: var(--icon-size);
      display: grid;
      place-items: center;
      line-height: 0;

      & > svg.icon {
        --size: var(--icon-size);
        --color: var(--accent-color);

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
      box-shadow: var(--shadow-md-shape) oklch(from var(--black) l c h / var(--shadow-opacity));
      background-color: var(--outline-bg);
      border: 1px solid var(--outline-border-color);

      transition-property: box-shadow, width, height, background-color, border-color;
      transition-duration: var(--duration-lg);
      transition-timing-function: var(--bezier-bounce);
    }

    &.copied {
      --outline-bg: oklch(from var(--accent-color) l c h / 0.1);
      --outline-border-color: oklch(from var(--accent-color) l c h / 0.2);
      --shadow-opacity: var(--shadow-md-opacity);
      --cover-width: calc(100% + var(--space-sm) * 2);
      --cover-height: calc(100% + var(--space-sm));

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
