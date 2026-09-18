<template>
  <UiPopover
    v-bind="attributes"
    :anchor="anchor"
    :offset="offset"
    :open="open"
    :placement="placement"
    class="menu-popover"
    @dismiss="onPopoverDismiss"
  >
    <slot name="header" />

    <UiScrollArea class="menu-scroll" fade-edges overscroll="contain" scrollbar-gutter="auto">
      <ul
        :id="id"
        ref="menu"
        role="menu"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        class="menu-list"
        @keydown="onKeydown"
      >
        <li v-for="(item, index) in items" :key="`${index}-${item.title}`" role="none">
          <button
            :ref="element => setItemReference(element, index)"
            role="menuitem"
            :aria-disabled="item.disabled || undefined"
            :data-tone="item.tone"
            :tabindex="index === activeIndex ? 0 : -1"
            :title="item.hint"
            type="button"
            @click="selectItem(item)"
            @focus="activeIndex = index"
            @pointerenter="onItemPointerEnter(index)"
          >
            <UiIcon v-if="item.icon" :icon="item.icon" :size="iconSize" class="item-icon" />
            <span class="title">{{ item.title }}</span>
          </button>
        </li>
      </ul>
    </UiScrollArea>
  </UiPopover>
</template>

<script lang="ts">
import type { Component } from 'vue'

import type { ComponentTone } from '../component.types'
import type { OverlayPlacement } from '../overlay/UiPopover.vue'

export type UiMenuItem<V> = {
  title: string
  value: V
  icon?: Component
  hint?: string
  tone?: ComponentTone
  disabled?: boolean
}

export type UiMenuProperties<V> = {
  id?: string
  open: boolean
  anchor: HTMLElement | null
  items: UiMenuItem<V>[]
  placement?: OverlayPlacement
  offset?: number
  iconSize?: string
  ariaLabel?: string
  ariaLabelledby?: string
  initialFocus?: 'first' | 'last'
}
</script>

<script generic="V" lang="ts" setup>
import { type ComponentPublicInstance, nextTick, ref, useAttrs, watch } from 'vue'

import { isTypeaheadKey, useTypeahead } from '@/composables/useTypeahead'

import UiScrollArea from '../layout/UiScrollArea.vue'
import UiPopover, { type PopoverDismissReason } from '../overlay/UiPopover.vue'
import UiIcon from '../UiIcon.vue'

const {
  id,
  open,
  anchor,
  items,
  placement = 'bottom-start',
  offset = 0,
  iconSize = '1.15rem',
  ariaLabel,
  ariaLabelledby,
  initialFocus = 'first',
} = defineProps<UiMenuProperties<V>>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  select: [item: UiMenuItem<V>]
}>()

defineOptions({ inheritAttrs: false })

const attributes = useAttrs()
const itemReferences = ref<(HTMLButtonElement | undefined)[]>([])
const activeIndex = ref(-1)

const setItemReference = (element: Element | ComponentPublicInstance | null, index: number): void => {
  itemReferences.value[index] = element instanceof HTMLButtonElement ? element : undefined
}

const itemIndexes = (): number[] => items.map((_, index) => index)

const focusItem = (index: number): void => {
  if (!Object.hasOwn(items, index)) return
  activeIndex.value = index
  itemReferences.value[index]?.focus()
}

const onItemPointerEnter = (index: number): void => {
  if (!matchMedia('(hover: hover)').matches) return
  focusItem(index)
}

const focusEdge = (edge: 'first' | 'last'): void => {
  const indexes = itemIndexes()
  const index = edge === 'first' ? indexes[0] : indexes.at(-1)
  if (index !== undefined) focusItem(index)
}

const moveFocus = (delta: -1 | 1): void => {
  const indexes = itemIndexes()
  if (indexes.length === 0) return

  const current = indexes.indexOf(activeIndex.value)
  const next =
    current === -1 ? (delta > 0 ? 0 : indexes.length - 1) : (current + delta + indexes.length) % indexes.length
  const index = indexes[next]
  if (index !== undefined) focusItem(index)
}

const typeahead = useTypeahead<number>({
  items: itemIndexes,
  activeIndex: () => itemIndexes().indexOf(activeIndex.value),
  getText: index => items[index]?.title ?? '',
  onMatch: focusItem,
})

const focusAnchor = (): void => {
  anchor?.focus({ preventScroll: true })
}

const close = (restoreFocus = false): void => {
  emit('update:open', false)
  if (restoreFocus) void nextTick(focusAnchor)
}

const selectItem = (item: UiMenuItem<V>): void => {
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
    focusEdge('first')
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    focusEdge('last')
    return
  }

  if (event.key === 'Tab') {
    // A popup menu is a composite widget: Tab/Shift+Tab leave it rather than
    // walking its menuitems. Move focus back to the anchor synchronously and
    // let the browser perform the normal Tab step from there.
    close()
    focusAnchor()
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    close(true)
    return
  }

  if (isTypeaheadKey(event)) typeahead.apply(event.key)
}

watch(
  () => open,
  async isOpen => {
    if (!isOpen) {
      activeIndex.value = -1
      typeahead.clear()
      return
    }

    await nextTick()
    focusEdge(initialFocus)
  },
  { immediate: true }
)
</script>

<style>
@layer components {
  .popover.menu-popover {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-sm);
    max-block-size: var(--overlay-available-block-size, 24rem);
    overflow: clip;
  }
}
</style>

<style scoped>
@layer components {
  .menu-scroll {
    min-block-size: 0;
    flex: 1 1 auto;
    --scroll-area-fade-color: var(--popover-bg, var(--surface-bg));
  }

  .menu-list {
    --accent: light-dark(var(--gray-600), var(--gray-400));
    --item-gap: var(--space-sm);
    --item-padding-inline: var(--space-sm);
    --item-padding-block: var(--space-sm);

    min-inline-size: 12rem;
    display: grid;
    gap: var(--space-xxs);

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
      color: var(--item-color, currentColor);
      background-color: var(--item-bg);
      text-align: start;
      cursor: pointer;

      transition-property: background-color, opacity;
      transition-duration: var(--duration-sm);
      transition-timing-function: var(--bezier-smooth);

      &[data-tone]:not([data-tone='neutral']) {
        --accent: var(--tone-color);
        --icon-color: var(--tone-color);
        --item-color: light-dark(
          oklch(from var(--tone-color) calc(l - 0.15) c h),
          oklch(from var(--tone-color) calc(l + 0.25) c h)
        );
      }

      &:focus-visible {
        --item-bg: color-mix(in oklch, var(--accent) 6%, transparent);
      }

      &[aria-disabled='true'] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (hover: hover) {
        &:hover {
          --item-bg: color-mix(in oklch, var(--accent) 6%, transparent);
        }
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
