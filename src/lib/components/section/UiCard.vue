<template>
  <component :is="tag" :data-padding="padding" :data-variant="variant" class="card"><slot /></component>
</template>

<script lang="ts">
export type UiCardVariant = 'elevated' | 'filled' | 'outlined'
export type UiCardPadding = 'none' | 'small' | 'medium' | 'large'

export type UiCardProperties = {
  tag?: 'div' | 'article' | 'section'
  variant?: UiCardVariant
  padding?: UiCardPadding
}
</script>

<script lang="ts" setup>
const { tag = 'div', variant = 'filled', padding = 'large' } = defineProps<UiCardProperties>()
</script>

<style scoped>
@layer components {
  .card {
    --card-padding-block: var(--space-xxl);
    --card-padding-inline: var(--space-xxl);
    --card-border-width: 0px;
    --card-border-color: transparent;
    --card-bg: var(--surface-bg);
    --card-shadow: var(--shadow-xs);
    --card-radius: var(--radius-md);

    display: var(--display, block);
    min-inline-size: 0;
    padding-block: var(--padding-block, var(--card-padding-block));
    padding-inline: var(--padding-inline, var(--card-padding-inline));
    border: var(--border-width, var(--card-border-width)) solid var(--border-color, var(--card-border-color));
    border-radius: var(--card-radius);
    box-shadow: var(--shadow, var(--card-shadow));

    &[data-padding='none'] {
      --card-padding-block: 0px;
      --card-padding-inline: 0px;
    }

    &[data-padding='small'] {
      --card-padding-block: var(--space-sm);
      --card-padding-inline: var(--space-sm);
    }

    &[data-padding='medium'] {
      --card-padding-block: var(--space-md);
      --card-padding-inline: var(--space-md);
    }

    &[data-variant='filled'] {
      background: var(--card-bg);
      --card-shadow: none;
    }

    &[data-variant='outlined'] {
      --card-border-width: 1px;
      --card-border-color: var(--divider-color);
      --card-shadow: none;
    }
  }
}
</style>
