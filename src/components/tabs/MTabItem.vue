<template>
  <div v-ripple="{ disabled }" :class="['tab-item', { active, disabled }]"><slot /></div>
</template>

<script lang="ts" setup>
const { active = false, disabled = false } = defineProps<{
  active?: boolean
  disabled?: boolean
}>()
</script>

<style scoped>
@layer components {
  .tab-item {
    position: relative;
    height: var(--tab-height);
    color: var(--color, var(--tab-color));
    cursor: var(--cursor, pointer);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: var(--gap, calc(var(--tab-font-size) * 1));

    will-change: color, opacity;
    transition-property: color, opacity;
    transition-duration: var(--duration-md);
    transition-timing-function: var(--bezier-smooth);

    user-select: none;
    font-size: var(--tab-font-size);
    gap: calc(var(--tab-font-size) / 2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: var(--pointer-events, auto);
    opacity: var(--opacity, 1);

    &.active {
      --tab-color: var(--tab-active-color);
    }

    &.disabled {
      --pointer-events: none;
      --opacity: 0.6;
      --cursor: not-allowed;
    }
  }
}
</style>