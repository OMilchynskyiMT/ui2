<template>
  <Teleport :to="teleportTo">
    <dialog
      ref="dialog"
      v-bind="getDialogAttributes()"
      :data-fullscreen="fullscreen || undefined"
      :data-phase="phase"
      @cancel="cancel"
      @close="closed"
      @transitionend.self="transitionend"
    >
      <div class="surface"><slot /></div>
    </dialog>
  </Teleport>
</template>

<script lang="ts">
export type Exposed = {
  show: (isModal?: boolean) => void
  close: () => void
  isVisible: () => boolean
}
</script>

<script lang="ts" setup>
import { onBeforeUnmount, ref, type TeleportProps, useAttrs, useTemplateRef } from 'vue'

defineOptions({ inheritAttrs: false })

type Phase = 'closed' | 'opened' | 'closing'

const attributes = useAttrs()

const {
  persistent = false,
  teleportTo = '#modals',
  fullscreen = false,
} = defineProps<{
  teleportTo?: TeleportProps['to']
  persistent?: boolean
  fullscreen?: boolean
}>()

const emit = defineEmits<{
  show: [modal: boolean]
  closing: []
  close: []
  cancel: [event: Event]
}>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const phase = ref<Phase>('closed')

let closeTimer: number | undefined

const getDialogAttributes = (): Record<string, unknown> => {
  const result = { ...attributes }
  delete result.open
  return result
}

const clearCloseTimer = (): void => {
  if (closeTimer === undefined) return

  clearTimeout(closeTimer)
  closeTimer = undefined
}

const parseCssTime = (value: string): number => {
  const trimmed = value.trim()
  // eslint-disable-next-line unicorn/prefer-number-coercion
  const amount = Number.parseFloat(trimmed)
  if (Number.isNaN(amount)) return 0

  return trimmed.endsWith('ms') ? amount : amount * 1000
}

const getTransitionDuration = (element: HTMLElement): number => {
  const styles = getComputedStyle(element)
  const durations = styles.transitionDuration.split(',').map(value => parseCssTime(value))
  const delays = styles.transitionDelay.split(',').map(value => parseCssTime(value))
  const count = Math.max(durations.length, delays.length)

  let result = 0

  for (let index = 0; index < count; index++) {
    const duration = durations[index % durations.length] ?? 0
    const delay = delays[index % delays.length] ?? 0

    result = Math.max(result, duration + delay)
  }

  return result
}

const finishClose = (): void => {
  clearCloseTimer()
  const element = dialog.value
  if (!element?.open) return

  phase.value = 'closed'
  element.close()
}

const scheduleClose = (): void => {
  const element = dialog.value
  if (!element) return
  clearCloseTimer()

  const duration = getTransitionDuration(element)

  if (duration === 0) {
    finishClose()
    return
  }

  closeTimer = setTimeout(finishClose, duration + 50)
}

const show = (isModal = true): void => {
  const element = dialog.value
  if (!element || element.open) return
  clearCloseTimer()

  phase.value = 'opened'

  if (isModal) {
    element.showModal()
  } else {
    element.show()
  }

  emit('show', isModal)
}

const close = (): void => {
  const element = dialog.value
  if (!element?.open) return
  if (phase.value === 'closing') return

  phase.value = 'closing'
  emit('closing')
  scheduleClose()
}

const isVisible = (): boolean => dialog.value?.open ?? false

const cancel = (event: Event): void => {
  emit('cancel', event)
  const prevented = event.defaultPrevented
  event.preventDefault()

  if (phase.value !== 'opened') return
  if (persistent || prevented) return

  close()
}

const closed = (): void => {
  clearCloseTimer()
  phase.value = 'closed'
  emit('close')
}

const transitionend = (event: TransitionEvent): void => {
  if (event.target !== dialog.value) return
  if (phase.value !== 'closing') return
  if (event.propertyName !== 'transform') return

  finishClose()
}

onBeforeUnmount(clearCloseTimer)

defineExpose<Exposed>({ show, close, isVisible })
</script>

<style scoped>
@layer components {
  dialog {
    --dialog-width: 32rem;
    --initial-translate-y: calc(-1 * var(--space-md));
    --outer-gap: var(--space-xxl);

    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    isolation: isolate;

    inline-size: var(--dialog-width);
    max-inline-size: calc(100vw - var(--outer-gap));
    max-block-size: calc(100dvh - var(--outer-gap));

    color: inherit;
    background-color: transparent;
    opacity: 0;
    overflow: visible;
    transform: translateY(var(--initial-translate-y));
    border-radius: var(--dialog-radius, var(--radius-md));
    box-shadow: var(--dialog-shadow, var(--shadow-md));

    transition-property: opacity, transform;
    transition-duration: var(--duration-md);
    transition-timing-function: var(--bezier-smooth);

    &[data-fullscreen] {
      inline-size: 100%;
      block-size: 100%;
      max-inline-size: 100%;
      max-block-size: 100%;
      border-radius: 0;
    }

    &[data-phase='opened'] {
      opacity: 1;
      transform: translateY(0);
    }

    &[data-phase='closing'] {
      opacity: 0;
      transform: translateY(var(--initial-translate-y));
    }

    & > div.surface {
      height: inherit;
      overflow: auto;
      overscroll-behavior: contain;

      border-radius: inherit;
      background-color: var(--dialog-bg, var(--bg));
    }

    &::backdrop {
      background-color: transparent;
      backdrop-filter: blur(0);

      transition-property: background-color, backdrop-filter;
      transition-duration: var(--duration-md);
      transition-timing-function: var(--bezier-smooth);
    }

    &[data-phase='opened']::backdrop {
      background-color: var(--dialog-backdrop-bg, oklch(0 0 0 / 0.25));
      backdrop-filter: var(--dialog-backdrop-filter, blur(0.15rem));
    }

    &[data-phase='closing']::backdrop {
      background-color: transparent;
      backdrop-filter: blur(0);
    }
  }

  @starting-style {
    dialog[data-phase='opened'] {
      opacity: 0;
      transform: translateY(var(--initial-translate-y));
    }

    dialog[data-phase='opened']::backdrop {
      background-color: transparent;
      backdrop-filter: blur(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    dialog,
    dialog::backdrop {
      transition-duration: 0s;
    }
  }
}
</style>
