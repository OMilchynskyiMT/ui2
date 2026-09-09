<template>
  <div ref="overlay" :data-placement="currentPlacement" class="anchored-overlay" popover="manual">
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

type OverlayRect = {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

type ViewportInsets = {
  blockStart: number
  blockEnd: number
  inlineStart: number
  inlineEnd: number
}

type ViewportBounds = {
  blockStart: number
  blockEnd: number
  inlineStart: number
  inlineEnd: number
}

let frame = 0
let resizeObserver: ResizeObserver | undefined

const isBottomPlacement = (value: OverlayPlacement): boolean => value.startsWith('bottom')
const isStartPlacement = (value: OverlayPlacement): boolean => value.endsWith('start')
const isEndPlacement = (value: OverlayPlacement): boolean => value.endsWith('end')
const oppositePlacement = (value: OverlayPlacement): OverlayPlacement => {
  if (value.startsWith('bottom')) return value.replace('bottom', 'top') as OverlayPlacement
  return value.replace('top', 'bottom') as OverlayPlacement
}

const isWebKit = (): boolean => {
  return typeof CSS !== 'undefined' && CSS.supports('-webkit-backdrop-filter', 'none')
}

const getSafeAreaInset = (property: string): number => {
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(property))
  return Number.isFinite(value) ? value : 0
}

const getViewportInsets = (): ViewportInsets => ({
  blockStart: Math.max(viewportPadding, getSafeAreaInset('--safe-area-top')),
  blockEnd: Math.max(viewportPadding, getSafeAreaInset('--safe-area-bottom')),
  inlineStart: Math.max(viewportPadding, getSafeAreaInset('--safe-area-left')),
  inlineEnd: Math.max(viewportPadding, getSafeAreaInset('--safe-area-right')),
})

const getViewportBounds = (insets: ViewportInsets): ViewportBounds => {
  const viewport = window.visualViewport
  const blockStart = viewport?.offsetTop ?? 0
  const inlineStart = viewport?.offsetLeft ?? 0
  const blockSize = viewport?.height ?? innerHeight
  const inlineSize = viewport?.width ?? innerWidth

  return {
    blockStart: blockStart + insets.blockStart,
    blockEnd: blockStart + blockSize - insets.blockEnd,
    inlineStart: inlineStart + insets.inlineStart,
    inlineEnd: inlineStart + inlineSize - insets.inlineEnd,
  }
}

const getAnchorRect = (): OverlayRect | undefined => {
  if (!anchor) return undefined

  const rect = anchor.getBoundingClientRect()
  const viewport = window.visualViewport

  // NOTE: WebKit reports client rects without the visual viewport offset while fixed
  // top-layer elements are positioned in layout-viewport coordinates
  const inlineOffset = viewport && isWebKit() ? viewport.offsetLeft : 0
  const blockOffset = viewport && isWebKit() ? viewport.offsetTop : 0

  return {
    top: rect.top + blockOffset,
    right: rect.right + inlineOffset,
    bottom: rect.bottom + blockOffset,
    left: rect.left + inlineOffset,
    width: rect.width,
    height: rect.height,
  }
}

const getAvailableBlockSize = (value: OverlayPlacement, anchorRect: OverlayRect, bounds: ViewportBounds): number => {
  return isBottomPlacement(value)
    ? bounds.blockEnd - anchorRect.bottom - offset
    : anchorRect.top - offset - bounds.blockStart
}

const resolvePlacement = (
  anchorRect: OverlayRect,
  overlayRect: OverlayRect,
  bounds: ViewportBounds
): OverlayPlacement => {
  const preferredSpace = getAvailableBlockSize(placement, anchorRect, bounds)
  const opposite = oppositePlacement(placement)
  const oppositeSpace = getAvailableBlockSize(opposite, anchorRect, bounds)

  if (overlayRect.height > preferredSpace && oppositeSpace > preferredSpace) {
    return opposite
  }

  return placement
}

const updatePosition = (): void => {
  const element = overlayReference.value
  if (!element) return

  const anchorRect = getAnchorRect()
  if (!anchorRect) {
    delete element.dataset.positioned
    return
  }

  if (matchAnchorWidth) {
    element.style.setProperty('--overlay-inline-size', `${snapToDevicePixel(anchorRect.width)}px`)
  } else {
    element.style.removeProperty('--overlay-inline-size')
  }

  const insets = getViewportInsets()
  const bounds = getViewportBounds(insets)
  element.style.setProperty(
    '--overlay-max-inline-size',
    `${snapToDevicePixel(Math.max(0, bounds.inlineEnd - bounds.inlineStart))}px`
  )

  const overlayRect = element.getBoundingClientRect()
  const resolvedPlacement = resolvePlacement(anchorRect, overlayRect, bounds)
  const availableBlockSize = Math.max(0, getAvailableBlockSize(resolvedPlacement, anchorRect, bounds))

  currentPlacement.value = resolvedPlacement
  element.style.setProperty('--overlay-available-block-size', `${snapToDevicePixel(availableBlockSize)}px`)

  const unclampedInlineStart = isEndPlacement(resolvedPlacement)
    ? anchorRect.right - overlayRect.width
    : isStartPlacement(resolvedPlacement)
      ? anchorRect.left
      : anchorRect.left + (anchorRect.width - overlayRect.width) / 2
  const maxInlineStart = Math.max(bounds.inlineStart, bounds.inlineEnd - overlayRect.width)
  const inlineStart = Math.min(Math.max(unclampedInlineStart, bounds.inlineStart), maxInlineStart)

  const unclampedBlockStart = isBottomPlacement(resolvedPlacement)
    ? anchorRect.bottom + offset
    : anchorRect.top - overlayRect.height - offset
  const maxBlockStart = Math.max(bounds.blockStart, bounds.blockEnd - overlayRect.height)
  const blockStart = Math.min(Math.max(unclampedBlockStart, bounds.blockStart), maxBlockStart)

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
  {
    target: window.visualViewport,
    type: 'resize',
    listener: requestPositionUpdate,
    options: { passive: true },
  },
  {
    target: window.visualViewport,
    type: 'scroll',
    listener: requestPositionUpdate,
    options: { passive: true },
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
    max-inline-size: var(--overlay-max-inline-size, calc(100dvw - 16px));
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
