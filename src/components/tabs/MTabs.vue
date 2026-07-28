<template>
  <ul ref="tabBarRef" class="tabs">
    <li
      v-for="tab in items"
      :key="tab.title"
      v-ripple="{ disabled: tab.disabled ?? false }"
      :class="['tab', { active: checkActive?.(tab) ?? false, disabled: tab.disabled ?? false }]"
      @click.prevent="onSelect?.(tab)"
    >
      <slot :name="`tab-${tab.value}`" :tab="tab">
        <MIcon v-if="tab.icon" :icon="tab.icon" />
        <span>{{ tab.title }}</span>
      </slot>
    </li>
    <span ref="indicator" class="indicator"></span>
  </ul>
</template>

<script lang="ts">
export type Item<Value> = {
  title: string
  value?: Value
  icon?: Component
  disabled?: boolean
}
export type CheckActive<Value> = (item: Item<Value>) => boolean
export type OnSelect<Value> = (item: Item<Value>) => void
</script>

<script generic="Value" lang="ts" setup>
import { type Component, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

import MIcon from '../MIcon.vue'

const { items, checkActive, onSelect } = defineProps<{
  items: Item<Value>[]
  checkActive?: CheckActive<Value>
  onSelect?: OnSelect<Value>
}>()

const tabBarReference = useTemplateRef('tabBarRef')
const indicatorReference = useTemplateRef('indicator')

const updateIndicatorStyle = () => {
  const tabBar = tabBarReference.value
  const indicator = indicatorReference.value

  if (!tabBar || !indicator) return

  const activeTab = tabBar.querySelector<HTMLElement>('.tab.active')
  if (!activeTab) {
    indicator.style.setProperty('--indicator-width', '0px')
    return
  }

  const tabBarRect = tabBar.getBoundingClientRect()
  const activeTabRect = activeTab.getBoundingClientRect()

  indicator.style.setProperty('--indicator-x', `${activeTabRect.left - tabBarRect.left}px`)
  indicator.style.setProperty('--indicator-y', `${activeTabRect.bottom - tabBarRect.bottom}px`)
  indicator.style.setProperty('--indicator-width', `${activeTabRect.width}px`)
}

const mutationObserver: MutationObserver = new MutationObserver(updateIndicatorStyle)
const resizeObserver: ResizeObserver = new ResizeObserver(updateIndicatorStyle)

onMounted(() => {
  const tabBar = tabBarReference.value
  if (!tabBar) return
  resizeObserver.observe(tabBar)
  mutationObserver.observe(tabBar, {
    attributes: true,
    childList: true,
    subtree: true,
  })

  updateIndicatorStyle()

  for (const tab of tabBar.querySelectorAll('.tab-item')) {
    resizeObserver.observe(tab)
  }
})

onBeforeUnmount(() => {
  mutationObserver?.disconnect()
  resizeObserver?.disconnect()
})
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
    --tab-gap: var(--space-xs);

    --tab-height: calc(var(--font-size) * 3);
    --tab-padding-inline: var(--space-sm);
    --tab-font-size: var(--font-size-md);
    --tab-color: var(--text-color);
    --tab-color-active: var(--link-color);
    --tab-bg: transparent;
    --tab-bg-active: var(--tab-bg);
    --tab-opacity: 1;

    --pointer-events: auto;

    position: relative;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: stretch;
    align-content: stretch;
    gap: var(--gap);

    & > .indicator {
      position: absolute;
      bottom: 0;
      block-size: var(--indicator-height);
      inline-size: var(--indicator-width);

      background-color: var(--indicator-color);
      border-radius: var(--radius-full);

      transform: translate(var(--indicator-x), var(--indicator-y));
      transition-property: transform, width;
      transition-duration: var(--duration-lg);
      transition-timing-function: var(--bezier-magnetic);
    }

    & > .tab {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--tab-gap);

      block-size: var(--tab-height);
      inline-size: auto;
      padding-inline: var(--tab-padding-inline);
      font-size: var(--tab-font-size);

      color: var(--tab-color);
      opacity: var(--tab-opacity);

      user-select: none;
      cursor: pointer;

      pointer-events: var(--pointer-events);
      overflow: hidden;

      transition-property: color, opacity;
      transition-duration: var(--duration-md);
      transition-timing-function: var(--bezier-smooth);

      &.active {
        --tab-color: var(--tab-color-active);
      }

      &.disabled {
        --tab-opacity: 0.6;
        --pointer-events: none;
        --cursor: not-allowed;
      }

      & > span {
        display: block;
        inline-size: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
