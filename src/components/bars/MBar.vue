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

  --sections-gap: 0;
  --items-gap: var(--space-sm);

  --bg: transparent;
  --color: inherit;

  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: var(--sections-gap);
  inline-size: 100%;
  min-block-size: var(--height);
  min-inline-size: 0;
  padding-inline: var(--padding-inline);
  padding-block: var(--padding-block);

  background: var(--bg);
  color: var(--color);

  & > :is(.leading, .main, .trailing) {
    display: flex;
    align-items: center;
    column-gap: var(--items-gap);
    flex-wrap: nowrap;
    min-inline-size: 0;
  }

  & > :is(.leading, .trailing) {
    flex: none;
  }

  & > .leading {
    grid-column: 1;
    justify-self: start;
  }

  & > .main {
    grid-column: 2;
    justify-self: start;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > .trailing {
    grid-column: 3;
    justify-self: end;
  }
}
</style>