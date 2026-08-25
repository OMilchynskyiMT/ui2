<template>
  <div
    ref="overlay"
    popover="manual"
    :data-placement="currentPlacement"
    class="anchored-overlay"
  >
    <slot />
  </div>
</template>

<script lang="ts">
export type OverlayPlacement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

export type AnchoredOverlayProperties = {
  anchor: HTMLElement | null
  placement?: OverlayPlacement
  offset?: number
  matchAnchorWidth?: boolean
  viewportPadding?: number
}
</script>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'

import { useSnapToDevicePixel } from '@/composables/useDeviceHardwareHelpers'
import { useEventListeners } from '@/composables/useEventListeners'

const {
  anchor,
  placement = 'bottom-start',
  offset = 0,
  matchAnchorWidth = false,
  viewportPadding = 8,
} = defineProps<AnchoredOverlayProperties>()

const overlayReference = useTemplateRef<HTMLDivElement>('overlay')
const currentPlacement = ref<OverlayPlacement>(placement)
const snapToDevicePixel = useSnapToDevicePixel

let frame = 0
let resizeObserver: ResizeObserver | undefined

const isBottomPlacement = (value: OverlayPlacement): boolean => value.startsWith('bottom')
const isStartPlacement = (value: OverlayPlacement): boolean => value.endsWith('start')
const isEndPlacement = (value: OverlayPlacement): boolean => value.endsWith('end')
const oppositePlacement = (value: OverlayPlacement): OverlayPlacement => {
  if (value.startsWith('bottom')) return value.replace('bottom', 'top') as OverlayPlacement
  return value.replace('top', 'bottom') as OverlayPlacement
}

const getAvailableBlockSize = (value: OverlayPlacement, anchorRect: DOMRect): number => {
  return isBottomPlacement(value)
    ? globalThis.innerHeight - anchorRect.bottom - offset - viewportPadding
    : anchorRect.top - offset - viewportPadding
}

const resolvePlacement = (anchorRect: DOMRect, overlayRect: DOMRect): OverlayPlacement => {
  const preferredSpace = getAvailableBlockSize(placement, anchorRect)
  const opposite = oppositePlacement(placement)
  const oppositeSpace = getAvailableBlockSize(opposite, anchorRect)

  if (overlayRect.height > preferredSpace && oppositeSpace > preferredSpace) {
    return opposite
  }

  return placement
}

const updatePosition = (): void => {
  const element = overlayReference.value
  if (!element) return

  if (!anchor) {
    element.removeAttribute('data-positioned')
    return
  }

  const anchorRect = anchor.getBoundingClientRect()

  if (matchAnchorWidth) {
    element.style.setProperty('--overlay-inline-size', `${snapToDevicePixel(anchorRect.width)}px`)
  } else {
    element.style.removeProperty('--overlay-inline-size')
  }

  element.style.setProperty('--overlay-viewport-padding', `${viewportPadding}px`)

  const overlayRect = element.getBoundingClientRect()
  const resolvedPlacement = resolvePlacement(anchorRect, overlayRect)
  const availableBlockSize = Math.max(0, getAvailableBlockSize(resolvedPlacement, anchorRect))

  currentPlacement.value = resolvedPlacement
  element.style.setProperty('--overlay-available-block-size', `${snapToDevicePixel(availableBlockSize)}px`)

  const unclampedInlineStart = isEndPlacement(resolvedPlacement)
    ? anchorRect.right - overlayRect.width
    : isStartPlacement(resolvedPlacement)
      ? anchorRect.left
      : anchorRect.left + (anchorRect.width - overlayRect.width) / 2
  const maxInlineStart = Math.max(viewportPadding, globalThis.innerWidth - viewportPadding - overlayRect.width)
  const inlineStart = Math.min(Math.max(unclampedInlineStart, viewportPadding), maxInlineStart)

  const unclampedBlockStart = isBottomPlacement(resolvedPlacement)
    ? anchorRect.bottom + offset
    : anchorRect.top - overlayRect.height - offset
  const maxBlockStart = Math.max(viewportPadding, globalThis.innerHeight - viewportPadding - overlayRect.height)
  const blockStart = Math.min(Math.max(unclampedBlockStart, viewportPadding), maxBlockStart)

  element.style.setProperty('--overlay-inset-block-start', `${snapToDevicePixel(blockStart)}px`)
  element.style.setProperty('--overlay-inset-inline-start', `${snapToDevicePixel(inlineStart)}px`)
  element.dataset.positioned = 'true'
}

const requestPositionUpdate = (): void => {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(updatePosition)
}

const { start, stop } = useEventListeners(() => [
  {
    target: globalThis,
    type: 'resize',
    listener: requestPositionUpdate,
    options: { passive: true },
  },
  {
    target: globalThis,
    type: 'scroll',
    listener: requestPositionUpdate,
    options: { capture: true, passive: true },
  },
])

const startResizeObserver = (): void => {
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(requestPositionUpdate)

  if (anchor) resizeObserver.observe(anchor)
  if (overlayReference.value) resizeObserver.observe(overlayReference.value)
}

onMounted(async () => {
  const element = overlayReference.value
  if (!element) return

  if (typeof element.showPopover === 'function') {
    element.showPopover()
  }

  await nextTick()
  updatePosition()
  startResizeObserver()
  start()
})

watch(
  () => [anchor, placement, offset, matchAnchorWidth, viewportPadding] as const,
  async () => {
    currentPlacement.value = placement
    overlayReference.value?.removeAttribute('data-positioned')
    await nextTick()
    updatePosition()
    startResizeObserver()
  },
  { flush: 'post' }
)

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  stop()
})
</script>

<style scoped>
@layer components {
  .anchored-overlay {
    position: fixed;
    inset: auto;
    inset-block-start: var(--overlay-inset-block-start, 0px);
    inset-inline-start: var(--overlay-inset-inline-start, 0px);
    inline-size: var(--overlay-inline-size, max-content);
    max-inline-size: calc(100vw - 2 * var(--overlay-viewport-padding, 8px));
    margin: 0;
    padding: 0;
    border: 0;
    overflow: visible;
    background: transparent;
    color: inherit;
    font: inherit;

    &:not([data-positioned='true']) {
      visibility: hidden;
    }
  }
}
</style>
