<template>
  <component :is="as" class="bar">
    <div class="leading"><slot name="leading" /></div>
    <div class="main"><slot /></div>
    <div class="trailing"><slot name="trailing" /></div>
  </component>
</template>

<script lang="ts" setup>
const { as = 'div' } = defineProps<{
  as?: string
}>()
</script>

<style scoped>
@layer components {
  .bar {
    --bar-min-block-size: auto;
    --bar-padding-inline: 0;
    --bar-padding-block: 0;
    --bar-padding-block-start: var(--bar-padding-block);
    --bar-padding-block-end: var(--bar-padding-block);
    --bar-padding-inline-start: var(--bar-padding-inline);
    --bar-padding-inline-end: var(--bar-padding-inline);
    --bar-sections-gap: var(--space-sm);
    --bar-items-gap: var(--space-sm);
    --bar-background: transparent;
    --bar-color: inherit;

    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 0;
    inline-size: 100%;
    min-block-size: var(--bar-min-block-size);
    min-inline-size: 0;
    padding-block-start: var(--bar-padding-block-start);
    padding-block-end: var(--bar-padding-block-end);
    padding-inline-start: var(--bar-padding-inline-start);
    padding-inline-end: var(--bar-padding-inline-end);

    background: var(--bar-background);
    color: var(--bar-color);

    & > :is(.leading, .main, .trailing) {
      min-inline-size: 0;
    }

    & > :is(.leading, .trailing) {
      display: flex;
      align-items: center;
      gap: var(--bar-items-gap);
      white-space: nowrap;
    }

    & > .leading {
      &:not(:empty) {
        margin-inline-end: var(--bar-sections-gap);
      }
    }

    & > .main {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    & > .trailing {
      &:not(:empty) {
        margin-inline-start: var(--bar-sections-gap);
      }
    }
  }
}
</style>
