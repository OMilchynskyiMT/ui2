<template>
  <div :data-adaptive="adaptive || undefined" :data-align="align" :data-justify="justify" class="cluster">
    <slot />
  </div>
</template>

<script lang="ts">
export type MClusterProperties = {
  adaptive?: boolean
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between'
}
</script>

<script lang="ts" setup>
const { adaptive = false, align = 'center', justify = 'start' } = defineProps<MClusterProperties>()
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

    &[data-adaptive] {
      & > :deep(*) {
        flex: 1 1 var(--cluster-item-min-size, 10rem);
      }
    }
  }
}
</style>
