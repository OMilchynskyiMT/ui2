<template>
  <MPopover
    v-bind="attributes"
    :anchor="anchor"
    :offset="offset"
    :open="open"
    :placement="placement"
    class="menu-popover"
    @dismiss="onPopoverDismiss"
  >
    <slot name="header" />

    <ul
      ref="menu"
      role="menu"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :style="{ '--icon-size': iconSize }"
      class="menu-list"
      @keydown="onKeydown"
    >
      <li v-for="(item, index) in items" :key="`${index}-${item.title}`" role="none">
        <button
          :ref="element => setItemReference(element, index)"
          role="menuitem"
          :aria-disabled="item.disabled || undefined"
          :disabled="item.disabled"
          :title="item.hint"
          type="button"
          @click="selectItem(item)"
          @focus="activeIndex = index"
          @pointerenter="focusItem(index)"
        >
          <MIcon v-if="item.icon" :icon="item.icon" :size="iconSize" class="item-icon" />
          <span class="title">{{ item.title }}</span>
        </button>
      </li>
    </ul>
  </MPopover>
</template>

<script lang="ts">
import type { Component } from 'vue'

import type { OverlayPlacement } from '../overlay/MPopover.vue'

export type MMenuItem<V> = {
  title: string
  value: V
  icon?: Component
  hint?: string
  disabled?: boolean
}

export type MMenuProperties<V> = {
  open: boolean
  anchor: HTMLElement | null
  items: MMenuItem<V>[]
  placement?: OverlayPlacement
  offset?: number
  iconSize?: string
  ariaLabel?: string
  ariaLabelledby?: string
  initialFocus?: 'first' | 'last'
}
</script>

<script generic="V" lang="ts" setup>
import { type ComponentPublicInstance, nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue'

import MIcon from '../MIcon.vue'
import MPopover, { type PopoverDismissReason } from '../overlay/MPopover.vue'

const {
  open,
  anchor,
  items,
  placement = 'bottom-start',
  offset = 0,
  iconSize = '1.15rem',
  ariaLabel,
  ariaLabelledby,
  initialFocus = 'first',
} = defineProps<MMenuProperties<V>>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  select: [item: MMenuItem<V>]
}>()

defineOptions({ inheritAttrs: false })

const attributes = useAttrs()
const itemReferences = ref<(HTMLButtonElement | undefined)[]>([])
const activeIndex = ref(-1)
let typeahead = ''
let typeaheadTimer: ReturnType<typeof globalThis.setTimeout> | undefined

const setItemReference = (element: Element | ComponentPublicInstance | null, index: number): void => {
  itemReferences.value[index] = element instanceof HTMLButtonElement ? element : undefined
}

const enabledIndexes = (): number[] => {
  return items.flatMap((item, index) => (item.disabled ? [] : [index]))
}

const focusItem = (index: number): void => {
  if (items[index]?.disabled) return
  activeIndex.value = index
  itemReferences.value[index]?.focus()
}

const focusEdge = (edge: 'first' | 'last'): void => {
  const indexes = enabledIndexes()
  const index = edge === 'first' ? indexes[0] : indexes.at(-1)
  if (index !== undefined) focusItem(index)
}

const moveFocus = (delta: -1 | 1): void => {
  const indexes = enabledIndexes()
  if (indexes.length === 0) return

  const current = indexes.indexOf(activeIndex.value)
  const next =
    current === -1 ? (delta > 0 ? 0 : indexes.length - 1) : (current + delta + indexes.length) % indexes.length
  const index = indexes[next]
  if (index !== undefined) focusItem(index)
}

const clearTypeahead = (): void => {
  typeahead = ''
  if (typeaheadTimer === undefined) return

  clearTimeout(typeaheadTimer)
  typeaheadTimer = undefined
}

const findTypeaheadIndex = (query: string): number | undefined => {
  const indexes = enabledIndexes()
  if (indexes.length === 0) return undefined

  const current = indexes.indexOf(activeIndex.value)
  const orderedIndexes = current === -1 ? indexes : [...indexes.slice(current + 1), ...indexes.slice(0, current + 1)]
  const normalizedQuery = query.toLocaleLowerCase()

  return orderedIndexes.find(index => items[index]?.title.toLocaleLowerCase().startsWith(normalizedQuery))
}

const applyTypeahead = (key: string): void => {
  if (typeaheadTimer !== undefined) clearTimeout(typeaheadTimer)

  const normalizedKey = key.toLocaleLowerCase()
  const repeatedKey = typeahead.length > 0 && [...typeahead].every(character => character === normalizedKey)
  typeahead = repeatedKey ? normalizedKey : `${typeahead}${normalizedKey}`

  const index = findTypeaheadIndex(typeahead)
  if (index !== undefined) focusItem(index)

  typeaheadTimer = setTimeout(clearTypeahead, 700)
}

const focusAnchor = (): void => {
  anchor?.focus()
}

const close = (restoreFocus = false): void => {
  emit('update:open', false)
  if (restoreFocus) void nextTick(focusAnchor)
}

const selectItem = (item: MMenuItem<V>): void => {
  if (item.disabled) return
  emit('select', item)
  close(true)
}

const onPopoverDismiss = (reason: PopoverDismissReason): void => {
  close(reason === 'escape')
}

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveFocus(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveFocus(-1)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    focusEdge(initialFocus)
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    focusEdge('last')
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    close(true)
    return
  }

  if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
    applyTypeahead(event.key)
  }
}

watch(
  () => open,
  async isOpen => {
    if (!isOpen) {
      activeIndex.value = -1
      clearTypeahead()
      return
    }

    await nextTick()
    focusEdge(initialFocus)
  },
  { immediate: true }
)

onBeforeUnmount(clearTypeahead)
</script>

<style>
@layer components {
  .popover.menu-popover {
    display: grid;
    gap: var(--space-md);
    padding: var(--space-sm);
    max-block-size: var(--overlay-available-block-size, 24rem);
    overflow: hidden;
  }
}
</style>

<style scoped>
@layer components {
  .menu-list {
    --accent: light-dark(var(--gray-600), var(--gray-400));
    --item-gap: var(--space-sm);
    --item-padding-inline: var(--space-sm);
    --item-padding-block: var(--space-sm);

    min-block-size: 0;
    min-inline-size: 12rem;
    display: grid;
    gap: var(--space-xxs);
    overflow: auto;

    & > li > button {
      --item-bg: transparent;
      --icon-color: var(--menu-icon-color, var(--accent));

      inline-size: 100%;
      display: flex;
      align-items: center;
      gap: var(--item-gap);
      padding-inline: var(--item-padding-inline);
      padding-block: var(--item-padding-block);
      border: 0;
      border-radius: var(--radius-lg);
      color: currentColor;
      background-color: var(--item-bg);
      text-align: start;
      cursor: pointer;

      transition-property: background-color, opacity;
      transition-duration: var(--duration-sm);
      transition-timing-function: var(--bezier-smooth);

      &:is(:hover, :focus-visible) {
        --item-bg: color-mix(in oklch, var(--accent) 6%, transparent);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      & > .item-icon {
        flex: 0 0 auto;
        --color: var(--icon-color);
      }

      & > .title {
        min-inline-size: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
