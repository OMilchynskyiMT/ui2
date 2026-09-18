<template>
  <div
    :id="id"
    ref="tablist"
    v-resize="updateIndicatorStyle"
    role="tablist"
    :aria-label="ariaLabel"
    class="tabs"
    @keydown="onKeydown"
  >
    <button
      v-for="(tab, index) in items"
      :id="getTabId(index)"
      :key="tab.value"
      v-resize="updateIndicatorStyle"
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
      @focus="focusedIndex = index"
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

import { useId } from '@/composables/useId'

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
const tablistReference = useTemplateRef<HTMLDivElement>('tablist')
const indicatorReference = useTemplateRef<HTMLSpanElement>('indicator')
const focusedIndex = ref(-1)
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

  if (!tablist || !indicator || !activeElement) {
    indicator?.style.setProperty('--indicator-width', '0px')
    return
  }

  const tablistRect = tablist.getBoundingClientRect()
  const activeRect = activeElement.getBoundingClientRect()

  indicator.style.setProperty('--indicator-x', `${activeRect.left - tablistRect.left}px`)
  indicator.style.setProperty('--indicator-y', `${activeRect.bottom - tablistRect.bottom}px`)
  indicator.style.setProperty('--indicator-width', `${activeRect.width}px`)
}

const syncIndicator = async (): Promise<void> => {
  await nextTick()
  updateIndicatorStyle()
}

onMounted(syncIndicator)
watch(() => [model.value, items] as const, syncIndicator, { flush: 'post' })
</script>

<style scoped>
@layer components {
  .tabs {
    --indicator-height: 2px;
    --indicator-color: var(--link-color);
    --indicator-width: 0;
    --indicator-x: 0;
    --indicator-y: 0;

    --gap: var(--space-sm);
    --tab-gap: var(--space-sm);
    --icon-size: v-bind(iconSize);

    --tab-height: 2.5rem;
    --tab-padding-inline: var(--space-sm);
    --tab-font-size: var(--font-size-md);
    --tab-color: var(--text-color);
    --tab-color-active: var(--link-color);
    --tab-bg: transparent;
    --tab-opacity: 1;

    position: relative;
    display: flex;
    flex-flow: row wrap;
    align-items: stretch;
    align-content: stretch;
    justify-content: flex-start;
    gap: var(--gap);

    & > .indicator {
      position: absolute;
      inset-block-end: 0;
      block-size: var(--indicator-height);
      inline-size: var(--indicator-width);
      background-color: var(--indicator-color);
      border-radius: var(--radius-full);
      transform: translate(var(--indicator-x), var(--indicator-y));

      will-change: transform, width;
      transition-property: transform, width;
      transition-duration: var(--duration-lg);
      transition-timing-function: var(--bezier-magnetic);
    }

    & > .tab {
      position: relative;
      isolation: isolate;
      overflow: hidden;

      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--tab-gap);

      block-size: var(--tab-height);
      inline-size: auto;

      padding-inline: var(--tab-padding-inline);
      border: 0;
      border-radius: var(--radius-md);
      color: var(--tab-color);
      background: var(--tab-bg);
      font-size: var(--tab-font-size);
      line-height: var(--icon-size);
      opacity: var(--tab-opacity);
      user-select: none;
      cursor: pointer;

      min-inline-size: 0;
      max-inline-size: 100%;

      will-change: background-color, color, opacity;
      transition-property: background-color, color, opacity;
      transition-duration: var(--duration-md);
      transition-timing-function: var(--bezier-smooth);

      &.active {
        --tab-color: var(--tab-color-active);
      }

      &:focus-visible {
        --tab-bg: color-mix(in oklch, var(--tab-color-active) 8%, transparent);
      }

      @media (hover: hover) {
        &:hover:not(:disabled) {
          --tab-bg: color-mix(in oklch, var(--tab-color-active) 6%, transparent);
        }
      }

      &:disabled {
        --tab-opacity: 0.6;
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
          overflow: hidden;
          text-overflow: ellipsis;
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
