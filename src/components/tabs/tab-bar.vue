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

let observer: MutationObserver

const updateIndicatorStyle = () => {
  console.log('updateIndicatorStyle')
  if (!tabBarReference.value || !indicatorReference.value) return

  const activeTab = tabBarReference.value.querySelector('.tab-item.active')
  if (!activeTab) return

  const { left, width } = activeTab.getBoundingClientRect()
  indicatorReference.value.style.setProperty('--indicator-x', `${left}px`)
  indicatorReference.value.style.setProperty('--indicator-width', `${width}px`)
}

onMounted(() => {
  if (!tabBarReference.value) return
  updateIndicatorStyle()
  observer = new MutationObserver(updateIndicatorStyle)
  observer.observe(tabBarReference.value, { childList: true, subtree: true, attributes: true })
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
    position: absolute;
    bottom: 0;
    background-color: var(--tab-active-border-color);
    height: var(--tab-border-width);
    border-radius: var(--radius-full);
    width: var(--indicator-width);
    transform: translateX(var(--indicator-x, 0));
    will-change: transform, width;
    transition:
      transform var(--duration-lg) var(--bezier-magnetic),
      width var(--duration-md) var(--bezier-smooth);
  }
}
</style>
