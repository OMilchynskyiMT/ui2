<template>
  <div
    ref="root"
    v-resize="updateLayout"
    role="group"
    :aria-label="ariaLabel"
    :data-ready="ready || undefined"
    class="adaptive-actions"
  >
    <div
      v-for="(action, index) in items"
      :key="`${index}-${action.label}`"
      :ref="element => setActionReference(element, index)"
      v-resize="requestLayout"
      :aria-hidden="isOverflowed(index) || undefined"
      :data-overflowed="isOverflowed(index) || undefined"
      :inert="isOverflowed(index) || undefined"
      class="action"
    >
      <slot :action="action" :overflowed="isOverflowed(index)" :select="() => select(action)" name="action">
        <UiButton
          :disabled="action.disabled"
          :icon="action.icon"
          :loading="action.loading"
          :size="action.size"
          :title="action.hint"
          :tone="action.tone"
          :variant="action.variant"
          @click="select(action)"
        >
          {{ action.label }}
        </UiButton>
      </slot>
    </div>

    <div
      ref="overflow"
      v-resize="requestLayout"
      :aria-hidden="overflowedActions.length === 0 || undefined"
      :data-measuring="overflowedActions.length === 0 || undefined"
      :inert="overflowedActions.length === 0 || undefined"
      class="overflow"
    >
      <slot :actions="overflowedActions" :select="select" name="overflow">
        <UiMenuButton
          v-model:open="overflowOpen"
          :aria-label="overflowAriaLabel"
          :icon="EllipsisVerticalIcon"
          :items="overflowMenuItems"
          :menu-aria-label="overflowAriaLabel"
          :offset="offset"
          :placement="placement"
          layout="icon"
          tone="neutral"
          variant="text"
          @select="select($event.value)"
        />
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import type { Component } from 'vue'

import type { Size as UiButtonSize, Variant as UiButtonVariant } from '../buttons/UiButton.vue'
import type { ComponentTone } from '../component.types'
import type { OverlayPlacement } from '../overlay/UiPopover.vue'

export type UiAdaptiveAction<Value> = {
  label: string
  value: Value
  icon?: Component
  hint?: string
  disabled?: boolean
  loading?: boolean
  priority?: number
  tone?: ComponentTone
  variant?: UiButtonVariant
  size?: UiButtonSize
}

export type UiAdaptiveActionsProperties<Value> = {
  items: UiAdaptiveAction<Value>[]
  ariaLabel?: string
  overflowAriaLabel?: string
  placement?: OverlayPlacement
  offset?: number
  maxVisible?: number
}

export type UiAdaptiveActionsExpose = {
  recalculate: () => void
  visibleCount: number
  overflowCount: number
}
</script>

<script generic="Value" lang="ts" setup>
import {
  type ComponentPublicInstance,
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import { EllipsisVerticalIcon } from '@lucide/vue'

import UiButton from '../buttons/UiButton.vue'
import type { UiMenuItem } from '../menu/UiMenu.vue'
import UiMenuButton from '../menu/UiMenuButton.vue'

const {
  items,
  ariaLabel,
  overflowAriaLabel = 'More actions',
  placement = 'bottom-end',
  offset = 6,
  maxVisible,
} = defineProps<UiAdaptiveActionsProperties<Value>>()

const emit = defineEmits<{
  select: [action: UiAdaptiveAction<Value>]
  'overflow-change': [actions: UiAdaptiveAction<Value>[]]
}>()

const rootReference = useTemplateRef<HTMLDivElement>('root')
const overflowReference = useTemplateRef<HTMLDivElement>('overflow')
const actionReferences = ref<(HTMLDivElement | undefined)[]>([])
const visibleIndexes = ref<number[]>([])
const ready = ref(false)
const overflowOpen = ref(false)
let frame = 0

const visibleIndexSet = computed(() => new Set(visibleIndexes.value))
const overflowedActions = computed(() => items.filter((_, index) => !visibleIndexSet.value.has(index)))
const overflowMenuItems = computed<UiMenuItem<UiAdaptiveAction<Value>>[]>(() => {
  return overflowedActions.value.map(action => ({
    title: action.label,
    value: action,
    icon: action.icon,
    hint: action.hint,
    tone: action.tone,
    disabled: action.disabled ?? action.loading,
  }))
})

const setActionReference = (element: Element | ComponentPublicInstance | null, index: number): void => {
  actionReferences.value[index] = element instanceof HTMLDivElement ? element : undefined
}

const isOverflowed = (index: number): boolean => ready.value && !visibleIndexSet.value.has(index)

const getGap = (element: HTMLElement): number => {
  const value = Number.parseFloat(getComputedStyle(element).columnGap)
  return Number.isFinite(value) ? value : 0
}

const getTotalInlineSize = (indexes: number[], widths: number[], gap: number, overflowWidth = 0): number => {
  const actionsWidth = indexes.reduce((total, index) => total + (widths[index] ?? 0), 0)
  const itemCount = indexes.length + (overflowWidth > 0 ? 1 : 0)
  return actionsWidth + overflowWidth + Math.max(0, itemCount - 1) * gap
}

const updateLayout = (): void => {
  const root = rootReference.value
  const overflow = overflowReference.value
  if (!root || !overflow) return

  const widths = items.map((_, index) => actionReferences.value[index]?.getBoundingClientRect().width ?? 0)
  const available = root.getBoundingClientRect().width
  const gap = getGap(root)
  const overflowWidth = overflow.getBoundingClientRect().width
  const visibleLimit = Math.min(items.length, Math.max(0, Math.trunc(maxVisible ?? items.length)))
  const allIndexes = items.map((_, index) => index)

  if (visibleLimit === items.length && getTotalInlineSize(allIndexes, widths, gap) <= available) {
    visibleIndexes.value = allIndexes
    ready.value = true
    return
  }

  const candidates = allIndexes.toSorted((left, right) => {
    const priorityDifference = (items[right]?.priority ?? 0) - (items[left]?.priority ?? 0)
    return priorityDifference === 0 ? left - right : priorityDifference
  })
  const selected: number[] = []

  for (const index of candidates) {
    if (selected.length >= visibleLimit) break

    const next = [...selected, index]
    if (getTotalInlineSize(next, widths, gap, overflowWidth) <= available) {
      selected.push(index)
    }
  }

  visibleIndexes.value = selected.toSorted((left, right) => left - right)
  ready.value = true
}

const requestLayout = (): void => {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    updateLayout()
  })
}

const recalculate = (): void => requestLayout()

const select = (action: UiAdaptiveAction<Value>): void => {
  if (action.disabled || action.loading) return
  emit('select', action)
}

onMounted(async () => {
  await nextTick()
  updateLayout()
})

watch(
  () => [items, maxVisible] as const,
  async () => {
    ready.value = false
    actionReferences.value.length = items.length
    await nextTick()
    requestLayout()
  },
  { deep: true, flush: 'post' }
)

watch(
  [overflowedActions, ready],
  ([actions, isReady]) => {
    if (!isReady) return
    if (actions.length === 0) overflowOpen.value = false
    emit('overflow-change', actions)
  },
  { flush: 'post' }
)

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
})

defineExpose<UiAdaptiveActionsExpose>({
  recalculate,
  get visibleCount() {
    return visibleIndexes.value.length
  },
  get overflowCount() {
    return overflowedActions.value.length
  },
})
</script>

<style scoped>
@layer components {
  .adaptive-actions {
    position: relative;
    min-inline-size: 0;
    inline-size: 100%;
    max-inline-size: 100%;

    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: var(--adaptive-actions-justify, flex-end);
    gap: var(--adaptive-actions-gap, var(--space-sm));

    &:not([data-ready]) {
      visibility: hidden;
    }

    & > :is(.action, .overflow) {
      min-inline-size: 0;
      flex: 0 0 auto;
    }

    & > .action[data-overflowed],
    & > .overflow[data-measuring] {
      position: absolute;
      inset-block-start: 0;
      inset-inline-end: 0;
      visibility: hidden;
      pointer-events: none;
    }
  }
}
</style>
