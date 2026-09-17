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
.bar {
  --height: auto;
  --padding-inline: 0;
  --padding-block: 0;

  --sections-gap: var(--space-sm);
  --items-gap: var(--space-sm);

  --bg: transparent;
  --color: inherit;

  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 0;
  inline-size: 100%;
  min-block-size: var(--height);
  min-inline-size: 0;
  padding-block-start: var(--padding-block-start, var(--padding-block));
  padding-block-end: var(--padding-block-end, var(--padding-block));
  padding-inline-start: var(--padding-inline-start, var(--padding-inline));
  padding-inline-end: var(--padding-inline-end, var(--padding-inline));

  background: var(--bg);
  color: var(--color);

  & > :is(.leading, .main, .trailing) {
    min-inline-size: 0;
  }

  & > :is(.leading, .trailing) {
    display: flex;
    align-items: center;
    gap: var(--items-gap);
    white-space: nowrap;
  }

  & > .leading {
    &:not(:empty) {
      margin-inline-end: var(--sections-gap);
    }
  }

  & > .main {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > .trailing {
    &:not(:empty) {
      margin-inline-start: var(--sections-gap);
    }
  }
}
</style>
