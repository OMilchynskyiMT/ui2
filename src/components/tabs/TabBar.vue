<template>
  <div ref="tabBarRef" class="tab-bar">
    <slot />
    <div ref="indicator" class="indicator"></div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

const tabBarRef = useTemplateRef('tabBarRef')
const indicatorRef = useTemplateRef('indicator')

let observer: MutationObserver | null = null

const updateIndicatorStyle = () => {
  console.log('updateIndicatorStyle')
  if (!tabBarRef.value || !indicatorRef.value) return

  const activeTab = tabBarRef.value.querySelector('.tab-item.active')
  if (!activeTab) return

  const { left, width } = activeTab.getBoundingClientRect()
  indicatorRef.value.style.setProperty('--indicator-x', `${left}px`)
  indicatorRef.value.style.setProperty('--indicator-width', `${width}px`)
}

onMounted(() => {
  if (!tabBarRef.value) return
  updateIndicatorStyle()
  observer = new MutationObserver(updateIndicatorStyle)
  observer.observe(tabBarRef.value, { childList: true, subtree: true, attributes: true })
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped>
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
    will-change: transform, width;
    position: absolute;
    bottom: 0;
    background-color: var(--tab-active-border-color);
    height: var(--tab-border-width);
    border-radius: var(--radius-full);
    width: var(--indicator-width);
    transform: translateX(var(--indicator-x, 0));
    transition:
      transform var(--duration-lg) var(--bezier-magnetic),
      width var(--duration-md) var(--bezier-smooth);
  }
}
</style>
