<template>
  <Teleport to="#modals">
    <dialog
      ref="dialog"
      v-bind="dialogAttrs"
      :data-phase="phase"
      @cancel="cancel"
      @close="closed"
      @keydown.capture="keydown"
      @transitionend.self="transitionend"
    >
      <div class="surface"><slot /></div>
    </dialog>
  </Teleport>
</template>

<script lang="ts">
export type Exposed = {
  show: (modal?: boolean) => void
  close: () => void
}
</script>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, useAttrs, useTemplateRef } from 'vue'

defineOptions({ inheritAttrs: false })

type Phase = 'closed' | 'opened' | 'closing'

const attrs = useAttrs()

const { persistent = false } = defineProps<{
  persistent?: boolean
}>()

const emit = defineEmits<{
  show: [modal: boolean]
  close: []
  cancel: [event: Event]
}>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const phase = ref<Phase>('closed')

let closeTimer: number | undefined

const dialogAttrs = computed(() => {
  const result = { ...attrs }
  delete result.open
  return result
})

const clearCloseTimer = (): void => {
  if (closeTimer === undefined) return
  globalThis.clearTimeout(closeTimer)
  closeTimer = undefined
}

const parseCssTime = (value: string): number => {
  const trimmed = value.trim()
  const amount = Number.parseFloat(trimmed)
  if (Number.isNaN(amount)) return 0

  return trimmed.endsWith('ms') ? amount : amount * 1000
}

const getTransitionDuration = (element: HTMLElement): number => {
  const styles = globalThis.getComputedStyle(element)
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
  const element = dialog.value
  if (!element?.open) return
  clearCloseTimer()

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

  closeTimer = globalThis.setTimeout(finishClose, duration + 50)
}

const show = (modal = true): void => {
  const element = dialog.value
  if (!element || element.open) return
  clearCloseTimer()

  phase.value = 'opened'

  if (modal) {
    element.showModal()
  } else {
    element.show()
  }

  emit('show', modal)
}

const close = (): void => {
  const element = dialog.value
  if (!element?.open) return
  if (phase.value === 'closing') return

  phase.value = 'closing'
  scheduleClose()
}

const keydown = (event: KeyboardEvent): void => {
  if (!persistent) return
  if (event.key !== 'Escape') return
  if (!dialog.value?.open) return

  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()
}

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

defineExpose<Exposed>({ show, close })
</script>

<style scoped>
dialog {
  margin: auto;

  width: min(100% - 2rem, var(--dialog-width, 32rem));
  max-block-size: calc(100dvb - 2rem);

  color: inherit;
  background-color: transparent;
  opacity: 0;
  overflow: visible;
  transform: scale(0.96) translateY(-0.75rem);
  border-radius: var(--dialog-radius, var(--radius-md));
  box-shadow: var(--dialog-shadow, var(--shadow-md));

  transition-property: opacity, transform;
  transition-duration: var(--duration-md);
  transition-timing-function: var(--bezier-magnetic);

  &[data-phase='opened'] {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  &[data-phase='closing'] {
    opacity: 0;
    transform: scale(0.96) translateY(-0.75rem);
  }

  & > div.surface {
    max-block-size: inherit;
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
    transform: scale(0.96) translateY(-0.75rem);
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
</style>
