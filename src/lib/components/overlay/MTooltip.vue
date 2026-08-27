<template>
  <MPopover
    :anchor="anchor"
    :offset="offset"
    :open="open"
    :placement="placement"
    class="tooltip-popover"
    @dismiss="close"
  >
    <div :id="id" role="tooltip" class="tooltip">
      <slot>{{ text }}</slot>
    </div>
  </MPopover>
</template>

<script lang="ts">
import type { OverlayPlacement } from './MPopover.vue'

export type MTooltipProperties = {
  anchor: HTMLElement | null
  text?: string
  placement?: OverlayPlacement
  offset?: number
  delay?: number
  disabled?: boolean
}
</script>

<script lang="ts" setup>
import { onBeforeUnmount, ref, useId, watch } from 'vue'

import { useEventListeners } from '@/composables/useEventListeners'

import MPopover from './MPopover.vue'

const {
  anchor,
  text = '',
  placement = 'top',
  offset = 6,
  delay = 350,
  disabled = false,
} = defineProps<MTooltipProperties>()

const id = useId()
const open = ref(false)
const hovered = ref(false)
const focused = ref(false)
let openTimer: ReturnType<typeof globalThis.setTimeout> | undefined

const clearOpenTimer = (): void => {
  if (openTimer === undefined) return
  clearTimeout(openTimer)
  openTimer = undefined
}

const close = (): void => {
  clearOpenTimer()
  open.value = false
}

const scheduleOpen = (): void => {
  if (disabled || !anchor || open.value) return

  clearOpenTimer()
  openTimer = setTimeout(() => {
    openTimer = undefined
    open.value = true
  }, delay)
}

const onPointerEnter = (): void => {
  hovered.value = true
  scheduleOpen()
}

const onPointerLeave = (): void => {
  hovered.value = false
  if (!focused.value) close()
}

const onFocusIn = (): void => {
  focused.value = true
  scheduleOpen()
}

const onFocusOut = (event: Event): void => {
  if (!(event instanceof FocusEvent)) return
  if (event.relatedTarget instanceof Node && anchor?.contains(event.relatedTarget)) return

  focused.value = false
  if (!hovered.value) close()
}

const { start, stop } = useEventListeners(() => [
  { target: anchor, type: 'pointerenter', listener: onPointerEnter },
  { target: anchor, type: 'pointerleave', listener: onPointerLeave },
  { target: anchor, type: 'focusin', listener: onFocusIn },
  { target: anchor, type: 'focusout', listener: onFocusOut },
])

const updateDescription = (element: HTMLElement, add: boolean): void => {
  const ids = new Set((element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean))

  if (add) {
    ids.add(id)
  } else {
    ids.delete(id)
  }

  if (ids.size > 0) {
    element.setAttribute('aria-describedby', [...ids].join(' '))
    return
  }
  element.removeAttribute('aria-describedby')
}

let describedElement: HTMLElement | null = null

watch(
  () => [anchor, disabled] as const,
  ([nextAnchor, isDisabled]) => {
    stop()
    hovered.value = false
    focused.value = false
    close()

    if (describedElement) updateDescription(describedElement, false)
    describedElement = null

    if (!nextAnchor || isDisabled) return
    describedElement = nextAnchor
    updateDescription(nextAnchor, true)
    start()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearOpenTimer()
  stop()
  if (describedElement) updateDescription(describedElement, false)
})
</script>

<style>
@layer components {
  .popover.tooltip-popover {
    max-inline-size: min(20rem, calc(100dvw - 2rem));
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    background-color: light-dark(var(--gray-900), var(--gray-100));
    color: light-dark(var(--gray-100), var(--gray-900));
    box-shadow: var(--shadow-sm);
    font-size: var(--font-size-sm);
    pointer-events: none;
  }
}
</style>
