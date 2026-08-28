<template>
  <Teleport to="body">
    <Transition name="popover">
      <AnchoredOverlay
        v-if="open"
        :anchor="anchor"
        :match-anchor-width="matchAnchorWidth"
        :offset="offset"
        :placement="placement"
        :viewport-padding="viewportPadding"
      >
        <div ref="surface" v-bind="attributes" class="popover" @pointerdown.stop>
          <slot />
        </div>
      </AnchoredOverlay>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import type { OverlayPlacement } from './internal/AnchoredOverlay.vue'

export type PopoverDismissReason = 'outside' | 'escape'

export type MPopoverProperties = {
  open: boolean
  anchor: HTMLElement | null
  placement?: OverlayPlacement
  offset?: number
  matchAnchorWidth?: boolean
  viewportPadding?: number
}

export type { OverlayPlacement } from './internal/AnchoredOverlay.vue'
</script>

<script lang="ts" setup>
import { onBeforeUnmount, useAttrs, useTemplateRef, watch } from 'vue'

import { useEventListeners } from '@/composables/useEventListeners'

import AnchoredOverlay from './internal/AnchoredOverlay.vue'

const {
  open,
  anchor,
  placement = 'bottom-start',
  offset = 0,
  matchAnchorWidth = false,
  viewportPadding = 8,
} = defineProps<MPopoverProperties>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  dismiss: [reason: PopoverDismissReason]
}>()

defineOptions({ inheritAttrs: false })

const attributes = useAttrs()
const surfaceReference = useTemplateRef<HTMLDivElement>('surface')

const isContainsTarget = (element: HTMLElement | null | undefined, target: EventTarget | null): boolean => {
  return target instanceof Node && Boolean(element?.contains(target))
}

const dismiss = (reason: PopoverDismissReason): void => {
  if (!open) return
  emit('update:open', false)
  emit('dismiss', reason)
}

const onDocumentPointerDown = (event: Event): void => {
  if (isContainsTarget(surfaceReference.value, event.target)) return
  if (isContainsTarget(anchor, event.target)) return
  dismiss('outside')
}

const onDocumentKeydown = (event: Event): void => {
  if (!(event instanceof KeyboardEvent) || event.key !== 'Escape') return
  event.preventDefault()
  dismiss('escape')
}

const { start, stop } = useEventListeners(() => [
  {
    target: document,
    type: 'pointerdown',
    listener: onDocumentPointerDown,
    options: { capture: true },
  },
  {
    target: document,
    type: 'keydown',
    listener: onDocumentKeydown,
  },
])

watch(
  () => open,
  isOpen => {
    stop()
    if (isOpen) start()
  },
  { immediate: true }
)

onBeforeUnmount(stop)
</script>

<style>
@layer components {
  .popover {
    inline-size: 100%;
    background-color: var(--popover-bg, var(--surface-bg));
    border-radius: var(--popover-radius, var(--radius-md));
    box-shadow: var(--popover-shadow, var(--shadow-sm));
  }

  .anchored-overlay.popover-enter-active,
  .anchored-overlay.popover-leave-active {
    transition-property: translate, opacity;
    transition-duration: var(--duration-md);
  }

  .anchored-overlay.popover-enter-active {
    transition-timing-function: var(--bezier-smooth-entrance);
  }

  .anchored-overlay.popover-leave-active {
    transition-timing-function: var(--bezier-soft-exit);
  }

  .anchored-overlay[data-placement^='top'].popover-enter-from,
  .anchored-overlay[data-placement^='top'].popover-leave-to {
    translate: 0 0.5rem;
    opacity: 0;
  }

  .anchored-overlay[data-placement^='bottom'].popover-enter-from,
  .anchored-overlay[data-placement^='bottom'].popover-leave-to {
    translate: 0 -0.5rem;
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .anchored-overlay.popover-enter-active,
    .anchored-overlay.popover-leave-active {
      transition: none;
    }
  }
}
</style>
