<template>
  <component
    :is="tag"
    aria-hidden="true"
    :class="['skeleton', variant, { animated }]"
    :style="{
      '--skeleton-inline-size': resolvedInlineSize,
      '--skeleton-block-size': resolvedBlockSize,
    }"
  />
</template>

<script lang="ts">
export type MSkeletonProperties = {
  tag?: 'span' | 'div'
  variant?: 'text' | 'block' | 'circle'
  inlineSize?: string
  blockSize?: string
  animated?: boolean
}
</script>

<script lang="ts" setup>
import { computed } from 'vue'

const {
  tag = 'div',
  variant = 'block',
  inlineSize,
  blockSize,
  animated = true,
} = defineProps<MSkeletonProperties>()

const resolvedInlineSize = computed(() => {
  return inlineSize ?? (variant === 'circle' ? blockSize ?? '2.5rem' : '100%')
})
const resolvedBlockSize = computed(() => {
  return blockSize ?? (variant === 'circle' ? inlineSize ?? '2.5rem' : undefined)
})
</script>

<style scoped>
@layer components {
  .skeleton {
    --skeleton-bg: light-dark(var(--gray-200), var(--gray-700));
    --skeleton-highlight: light-dark(var(--gray-100), var(--gray-600));

    display: block;
    inline-size: var(--skeleton-inline-size);
    block-size: var(--skeleton-block-size, 1rem);
    overflow: hidden;
    border-radius: var(--radius-md);
    background: var(--skeleton-bg);

    &.text {
      --skeleton-block-size: 0.85em;
      border-radius: var(--radius-sm);
    }

    &.circle {
      aspect-ratio: 1;
      border-radius: 50%;
    }

    &.animated {
      background-image: linear-gradient(
        90deg,
        transparent 0%,
        oklch(from var(--skeleton-highlight) l c h / 0.7) 50%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: skeleton-wave 1.4s var(--bezier-smooth) infinite;
    }
  }

  @keyframes skeleton-wave {
    from {
      background-position: 200% 0;
    }

    to {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton.animated {
      animation: none;
    }
  }
}
</style>
