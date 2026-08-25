<template>
  <Teleport to="body">
    <PopupTransition>
      <div v-if="open" ref="positioner" :data-placement="currentPlacement" class="popup-positioner">
        <div ref="popup" v-bind="attributes" class="popup" @pointerdown.stop>
          <slot />
        </div>
      </div>
    </PopupTransition>
  </Teleport>
</template>

<script lang="ts">
export type Placement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

export type Properties = {
  open: boolean
  anchor: HTMLElement | null
  placement?: Placement
  offset?: number
  parentWidth?: boolean
}
</script>

<script lang="ts" setup>
import { nextTick, onUnmounted, ref, useAttrs, useTemplateRef, watch } from 'vue'

import PopupTransition from '@/components/transitions/PopupTransition.vue'

import { useSnapToDevicePixel } from '@/composables/useDeviceHardwareHelpers'
import { useEventListeners } from '@/composables/useEventListeners'

type Position = {
  blockStart: number
  inlineStart: number
}

const { placement = 'bottom-start', offset = 0, parentWidth = false, open, anchor } = defineProps<Properties>()

const emit = defineEmits<{
  close: []
}>()

defineOptions({
  inheritAttrs: false,
})

const attributes = useAttrs()
const popup = useTemplateRef<HTMLDivElement>('popup')
const positioner = useTemplateRef<HTMLDivElement>('positioner')
const currentPlacement = ref<Placement>(placement)

let frame = 0

const getPosition = (anchorRect: DOMRect, popupRect: DOMRect): Position => {
  const positions: Record<Placement, Position> = {
    'bottom-start': {
      blockStart: anchorRect.bottom + offset,
      inlineStart: anchorRect.left,
    },
    'bottom-end': {
      blockStart: anchorRect.bottom + offset,
      inlineStart: anchorRect.right - popupRect.width,
    },
    'top-start': {
      blockStart: anchorRect.top - popupRect.height - offset,
      inlineStart: anchorRect.left,
    },
    'top-end': {
      blockStart: anchorRect.top - popupRect.height - offset,
      inlineStart: anchorRect.right - popupRect.width,
    },
  }

  return positions[currentPlacement.value]
}

const snap = useSnapToDevicePixel
const updatePosition = (): void => {
  const element = positioner.value
  if (!anchor || !element) return

  const anchorRect = anchor.getBoundingClientRect()
  if (parentWidth) {
    element.style.setProperty('--inline-size', `${snap(anchorRect.width)}px`)
  } else {
    element.style.removeProperty('--inline-size')
  }

  const popupRect = element.getBoundingClientRect()
  const { blockStart, inlineStart } = getPosition(anchorRect, popupRect)

  element.style.setProperty('--inset-block-start', `${snap(blockStart)}px`)
  element.style.setProperty('--inset-inline-start', `${snap(inlineStart)}px`)
}

const requestPositionUpdate = (): void => {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    updatePosition()
  })
}

const isContainsTarget = (element: HTMLElement | null | undefined, target: EventTarget | null): boolean => {
  return target instanceof Node && Boolean(element?.contains(target))
}

const onDocumentPointerDown = (event: Event): void => {
  if (isContainsTarget(popup.value, event.target)) return
  if (isContainsTarget(anchor, event.target)) return

  emit('close')
}

const onDocumentKeydown = (event: Event): void => {
  if (!(event instanceof KeyboardEvent)) return
  if (event.key !== 'Escape') return

  emit('close')
}

const { start, stop } = useEventListeners(() => [
  {
    target: globalThis,
    type: 'resize',
    listener: requestPositionUpdate,
    options: {
      passive: true,
    },
  },
  {
    target: globalThis,
    type: 'scroll',
    listener: requestPositionUpdate,
    options: {
      capture: true,
      passive: true,
    },
  },
  {
    target: document,
    type: 'pointerdown',
    listener: onDocumentPointerDown,
  },
  {
    target: document,
    type: 'keydown',
    listener: onDocumentKeydown,
  },
])

watch(
  () => [open, anchor, placement, offset, parentWidth] as const,
  async ([isOpen]) => {
    stop()
    cancelAnimationFrame(frame)

    if (!isOpen) return
    currentPlacement.value = placement
    await nextTick()
    updatePosition()
    start()
  },
  {
    immediate: true,
    flush: 'post',
  }
)

onUnmounted(() => {
  cancelAnimationFrame(frame)
  stop()
})
</script>

<style scoped>
@layer components {
  .popup-positioner {
    position: fixed;
    inset-block-start: var(--inset-block-start, 0px);
    inset-inline-start: var(--inset-inline-start, 0px);
    inline-size: var(--inline-size, max-content);
  }

  .popup {
    inline-size: 100%;
  }
}
</style>
