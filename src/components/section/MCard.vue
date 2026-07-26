<template>
  <div class="card"><slot /></div>
</template>

<style scoped>
div.card {
  --bg: var(--surface-bg);
  --padding-block: var(--space-xxl);
  --padding-inline: var(--space-xxl);
  --radius: var(--radius-md);
  --shadow: var(--shadow-xs);

  display: block;
  min-inline-size: 0;
  padding-block: var(--padding-block);
  padding-inline: var(--padding-inline);
  border-radius: var(--radius);
  background: var(--bg);
  box-shadow: var(--shadow);
}
</style>
