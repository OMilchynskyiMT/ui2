<template>
  <div ref="tabBarRef" class="tab-bar">
    <slot />
    <div ref="indicator" class="indicator"></div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

const tabBarReference = useTemplateRef('tabBarRef')
const indicatorReference = useTemplateRef('indicator')

const updateIndicatorStyle = () => {
  const tabBar = tabBarReference.value
  const indicator = indicatorReference.value

  if (!tabBar || !indicator) return

  const activeTab = tabBar.querySelector<HTMLElement>('.tab-item.active')
  if (!activeTab) {
    indicator.style.setProperty('--indicator-width', '0px')
    return
  }

  const tabBarRect = tabBar.getBoundingClientRect()
  const activeTabRect = activeTab.getBoundingClientRect()

  indicator.style.setProperty('--indicator-x', `${activeTabRect.left - tabBarRect.left}px`)
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
  .tab-bar {
    position: relative;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: stretch;
    align-content: stretch;
    gap: var(--gap, 0);

    & > .indicator {
      position: absolute;
      bottom: 0;
      background-color: var(--tab-active-border-color);
      height: var(--tab-border-width);
      border-radius: var(--radius-full);
      width: var(--indicator-width, 0);
      transform: translateX(var(--indicator-x, 0));
      transition:
        transform var(--duration-lg) var(--bezier-magnetic),
        width var(--duration-md) var(--bezier-smooth);
    }
  }
}
</style>