<template>
  <component :is="tag" :data-align="align" :data-justify="justify" class="cluster">
    <slot />
  </component>
</template>

<script lang="ts">
export type UiClusterProperties = {
  tag?: string
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between'
}
</script>

<script lang="ts" setup>
const { align = 'center', justify = 'start', tag = 'div' } = defineProps<UiClusterProperties>()
</script>

<style scoped>
@layer components {
  .cluster {
    min-inline-size: 0;
    max-inline-size: 100%;

    display: flex;
    flex-wrap: wrap;
    gap: var(--cluster-gap, var(--space-sm));

    &[data-align='start'] {
      align-items: flex-start;
    }

    &[data-align='center'] {
      align-items: center;
    }

    &[data-align='end'] {
      align-items: flex-end;
    }

    &[data-align='baseline'] {
      align-items: baseline;
    }

    &[data-align='stretch'] {
      align-items: stretch;
    }

    &[data-justify='start'] {
      justify-content: flex-start;
    }

    &[data-justify='center'] {
      justify-content: center;
    }

    &[data-justify='end'] {
      justify-content: flex-end;
    }

    &[data-justify='between'] {
      justify-content: space-between;
    }
  }
}
</style>
