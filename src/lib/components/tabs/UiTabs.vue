<template>
  <div
    :data-overflow-left="hasOverflowLeft || undefined"
    :data-overflow-right="hasOverflowRight || undefined"
    class="tabs-root"
  >
    <div ref="viewport" v-resize="updateScrollState" class="viewport" @scroll.passive="updateScrollState">
      <div
        :id="id"
        ref="tablist"
        v-resize="updateLayout"
        role="tablist"
        aria-orientation="horizontal"
        :aria-label="ariaLabel"
        class="tabs"
        @focusout="onFocusout"
        @keydown="onKeydown"
      >
        <button
          v-for="(tab, index) in items"
          :id="getTabId(index)"
          :key="tab.value"
          v-resize="updateLayout"
          v-ripple="{ disabled: tab.disabled ?? false }"
          role="tab"
          :aria-controls="slots.panel ? panelId : undefined"
          :aria-disabled="tab.disabled || undefined"
          :aria-selected="tab.value === model"
          :class="['tab', { active: tab.value === model }]"
          :disabled="tab.disabled"
          :tabindex="index === tabStopIndex ? 0 : -1"
          type="button"
          @click="activate(tab)"
          @focus="onFocus(index)"
        >
          <span class="content">
            <slot :name="`tab-${tab.value}`" :tab="tab">
              <UiIcon v-if="tab.icon" :icon="tab.icon" :size="iconSize" />
              <span class="label">{{ tab.title }}</span>
            </slot>
          </span>
        </button>

        <span ref="indicator" aria-hidden="true" class="indicator" />
      </div>
    </div>
  </div>

  <div v-if="slots.panel" :id="panelId" role="tabpanel" :aria-labelledby="activeTabId" class="tab-panel">
    <slot :tab="activeTab" name="panel" />
  </div>
</template>

<script lang="ts">
import type { Component } from 'vue'

export type UiTabItem<Value extends string | number> = {
  title: string
  value: Value
  icon?: Component
  disabled?: boolean
}

export type UiTabsProperties<Value extends string | number> = {
  id?: string
  items: UiTabItem<Value>[]
  activation?: 'automatic' | 'manual'
  ariaLabel?: string
  iconSize?: string
}
</script>

<script generic="Value extends string | number" lang="ts" setup>
import { computed, nextTick, onMounted, ref, useSlots, useTemplateRef, watch } from 'vue'

import { useId } from '@/lib/composables/useId'

import UiIcon from '../UiIcon.vue'

const {
  id = useId(),
  items,
  activation = 'automatic',
  ariaLabel,
  iconSize = '1.25rem',
} = defineProps<UiTabsProperties<Value>>()

const emit = defineEmits<{
  change: [tab: UiTabItem<Value>]
}>()

const model = defineModel<Value>({ required: true })
const slots = useSlots()
const viewportReference = useTemplateRef<HTMLDivElement>('viewport')
const tablistReference = useTemplateRef<HTMLDivElement>('tablist')
const indicatorReference = useTemplateRef<HTMLSpanElement>('indicator')
const focusedIndex = ref(-1)
const hasOverflowLeft = ref(false)
const hasOverflowRight = ref(false)
const panelId = `${id}-panel`

const getTabId = (index: number): string => `${id}-tab-${index}`
const enabledIndexes = (): number[] => items.flatMap((tab, index) => (tab.disabled ? [] : [index]))

const activeIndex = computed(() => items.findIndex(tab => tab.value === model.value))
const activeTab = computed(() => items[activeIndex.value])
const tabStopIndex = computed(() => {
  const focusedTab = items[focusedIndex.value]
  if (focusedTab && !focusedTab.disabled) return focusedIndex.value

  const active = items[activeIndex.value]
  if (active && !active.disabled) return activeIndex.value

  return enabledIndexes()[0] ?? -1
})
const activeTabId = computed(() => (activeIndex.value === -1 ? undefined : getTabId(activeIndex.value)))

const getTabElement = (index: number): HTMLButtonElement | undefined => {
  return tablistReference.value?.querySelectorAll<HTMLButtonElement>('.tab')[index]
}

const activate = (tab: UiTabItem<Value>): void => {
  if (tab.disabled || tab.value === model.value) return

  model.value = tab.value
  emit('change', tab)
}

const focusIndex = (index: number): void => {
  const tab = items[index]
  if (!tab || tab.disabled) return

  focusedIndex.value = index
  getTabElement(index)?.focus()

  if (activation === 'automatic') {
    activate(tab)
  }
}

const focusEdge = (edge: 'first' | 'last'): void => {
  const indexes = enabledIndexes()
  const index = edge === 'first' ? indexes[0] : indexes.at(-1)
  if (index !== undefined) focusIndex(index)
}

const moveFocus = (delta: -1 | 1): void => {
  const indexes = enabledIndexes()
  if (indexes.length === 0) return

  const currentIndex = indexes.indexOf(focusedIndex.value === -1 ? activeIndex.value : focusedIndex.value)
  const nextIndex =
    currentIndex === -1
      ? delta > 0
        ? 0
        : indexes.length - 1
      : (currentIndex + delta + indexes.length) % indexes.length
  const itemIndex = indexes[nextIndex]

  if (itemIndex !== undefined) focusIndex(itemIndex)
}

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    moveFocus(1)
    return
  }

  if (event.key === 'ArrowLeft') {
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

  if (activation === 'manual' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    const tab = items[focusedIndex.value]
    if (tab) activate(tab)
  }
}

const updateIndicatorStyle = (): void => {
  const tablist = tablistReference.value
  const indicator = indicatorReference.value
  const activeElement = activeIndex.value === -1 ? undefined : getTabElement(activeIndex.value)
  const activeContent = activeElement?.querySelector<HTMLElement>('.content')

  if (!tablist || !indicator || !activeElement || !activeContent) {
    indicator?.style.setProperty('--indicator-width', '0px')
    return
  }

  const tablistRect = tablist.getBoundingClientRect()
  const contentRect = activeContent.getBoundingClientRect()

  indicator.style.setProperty('--indicator-x', `${contentRect.left - tablistRect.left}px`)
  indicator.style.setProperty('--indicator-width', `${contentRect.width}px`)
}

const updateScrollState = (): void => {
  const viewport = viewportReference.value
  const tablist = tablistReference.value
  if (!viewport || !tablist) return

  const viewportRect = viewport.getBoundingClientRect()
  const tablistRect = tablist.getBoundingClientRect()

  hasOverflowLeft.value = tablistRect.left < viewportRect.left - 1
  hasOverflowRight.value = tablistRect.right > viewportRect.right + 1
}

const updateLayout = (): void => {
  updateIndicatorStyle()
  updateScrollState()
}

const getScrollBehavior = (): ScrollBehavior => {
  return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

const scrollTabIntoView = (index: number): void => {
  const viewport = viewportReference.value
  const tab = getTabElement(index)
  if (!viewport || !tab) return

  const viewportRect = viewport.getBoundingClientRect()
  const tabRect = tab.getBoundingClientRect()
  const scrollPadding = Number.parseFloat(getComputedStyle(viewport).scrollPaddingInlineStart) || 0
  const visibleLeft = viewportRect.left + scrollPadding
  const visibleRight = viewportRect.right - scrollPadding

  let delta = 0
  if (tabRect.left < visibleLeft) {
    delta = tabRect.left - visibleLeft
  } else if (tabRect.right > visibleRight) {
    delta = tabRect.right - visibleRight
  }

  if (Math.abs(delta) <= 1) return

  viewport.scrollBy({ left: delta, behavior: getScrollBehavior() })
}

const onFocus = (index: number): void => {
  focusedIndex.value = index
  scrollTabIntoView(index)
}

const onFocusout = (event: FocusEvent): void => {
  const nextTarget = event.relatedTarget
  if (!(nextTarget instanceof Node) || !tablistReference.value?.contains(nextTarget)) {
    focusedIndex.value = -1
  }
}

const syncActiveTab = async (): Promise<void> => {
  await nextTick()
  updateLayout()

  if (activeIndex.value !== -1) {
    scrollTabIntoView(activeIndex.value)
  }
}

onMounted(syncActiveTab)
watch(() => [model.value, items] as const, syncActiveTab, { flush: 'post' })
</script>

<style scoped>
@layer components {
  .tabs-root {
    --indicator-height: 3px;
    --indicator-color: var(--link-color);
    --indicator-width: 0;
    --indicator-x: 0;

    --gap: var(--space-xxs);
    --tab-gap: var(--space-sm);
    --icon-size: v-bind(iconSize);

    --tab-height: 3rem;
    --tab-padding-inline: var(--space-md);
    --tab-font-size: var(--font-size-md);
    --tab-color: var(--text-color-secondary);
    --tab-color-active: var(--link-color);
    --tab-bg: transparent;
    --tab-bg-hover: color-mix(in oklch, var(--text-color) 5%, transparent);
    --tab-bg-active: color-mix(in oklch, var(--tab-color-active) 9%, transparent);
    --tab-opacity: 1;

    --overflow-fade-size: var(--space-xl);
    --scroll-padding-inline: var(--overflow-fade-size);

    min-inline-size: 0;
    overflow: hidden;

    & > .viewport {
      min-inline-size: 0;
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-inline: contain;
      scrollbar-width: none;
      scroll-padding-inline: var(--scroll-padding-inline);
      -webkit-mask-image: linear-gradient(
        to right,
        var(--mask-left, #000) 0,
        #000 var(--overflow-fade-size),
        #000 calc(100% - var(--overflow-fade-size)),
        var(--mask-right, #000) 100%
      );
      mask-image: linear-gradient(
        to right,
        var(--mask-left, #000) 0,
        #000 var(--overflow-fade-size),
        #000 calc(100% - var(--overflow-fade-size)),
        var(--mask-right, #000) 100%
      );

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &[data-overflow-left] > .viewport {
      --mask-left: transparent;
    }

    &[data-overflow-right] > .viewport {
      --mask-right: transparent;
    }
  }

  .tabs {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    align-items: stretch;
    gap: var(--gap);

    inline-size: max-content;
    min-inline-size: 100%;

    box-shadow: inset 0 calc(-1 * var(--border-width-thin)) 0 var(--divider-color);

    & > .indicator {
      position: absolute;
      z-index: 2;
      inset-block-end: 0;
      inset-inline-start: 0;
      block-size: var(--indicator-height);
      inline-size: var(--indicator-width);
      background-color: var(--indicator-color);
      border-radius: var(--radius-full) var(--radius-full) 0 0;
      transform: translateX(var(--indicator-x));
      pointer-events: none;

      transition-property: transform, width;
      transition-duration: var(--duration-lg);
      transition-timing-function: var(--bezier-emphasized);
    }

    & > .tab {
      position: relative;
      isolation: isolate;
      overflow: hidden;

      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      gap: var(--tab-gap);

      block-size: var(--tab-height);
      inline-size: auto;

      padding-inline: var(--tab-padding-inline);
      border: 0;
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      color: var(--tab-color);
      background-color: var(--tab-bg);
      font-size: var(--tab-font-size);
      font-weight: var(--font-weight-medium);
      line-height: var(--line-height-compact);
      opacity: var(--tab-opacity);
      user-select: none;
      cursor: pointer;
      scroll-margin-inline: var(--scroll-padding-inline);

      min-inline-size: 0;
      max-inline-size: none;

      transition-property: background-color, color, opacity;
      transition-duration: var(--duration-md);
      transition-timing-function: var(--bezier-smooth);

      &.active {
        --tab-color: var(--tab-color-active);
        --tab-bg: var(--tab-bg-active);
      }

      &:focus-visible {
        outline-offset: calc(-1 * var(--focus-ring-width));
      }

      @media (hover: hover) {
        &:hover:not(:disabled, .active) {
          --tab-color: var(--text-color-strong);
          --tab-bg: var(--tab-bg-hover);
        }

        &.active:hover:not(:disabled) {
          --tab-bg: color-mix(in oklch, var(--tab-color-active) 12%, transparent);
        }
      }

      &:active:not(:disabled) {
        --tab-bg: color-mix(in oklch, var(--tab-color-active) 14%, transparent);
      }

      &:disabled {
        --tab-opacity: 0.45;
        cursor: not-allowed;
      }

      & > span.content {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--tab-gap);

        min-inline-size: 0;
        max-inline-size: 100%;

        & > svg.icon {
          flex: 0 0 var(--icon-size);
          inline-size: var(--icon-size);
          block-size: var(--icon-size);
        }

        & > span.label {
          min-inline-size: 0;
          white-space: nowrap;
        }
      }
    }
  }

  .tab-panel {
    min-inline-size: 0;
  }
}
</style>
