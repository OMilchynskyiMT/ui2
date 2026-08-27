<template>
  <div
    v-bind="attributes"
    :data-axis="axis"
    :data-fade-edges="fadeEdges || undefined"
    :data-scroll-block-after="canScrollBlockAfter || undefined"
    :data-scroll-block-before="canScrollBlockBefore || undefined"
    :data-scroll-inline-after="canScrollInlineAfter || undefined"
    :data-scroll-inline-before="canScrollInlineBefore || undefined"
    :style="scrollAreaStyle"
    class="scroll-area"
  >
    <div ref="viewport" v-resize="updateScrollState" class="viewport" @scroll.passive="onScroll">
      <div v-resize="updateScrollState" class="content">
        <slot />
      </div>
    </div>

    <div aria-hidden="true" class="edge-fade block-before" />
    <div aria-hidden="true" class="edge-fade block-after" />
    <div aria-hidden="true" class="edge-fade inline-before" />
    <div aria-hidden="true" class="edge-fade inline-after" />
  </div>
</template>

<script lang="ts">
export type MScrollAreaAxis = 'block' | 'inline' | 'both'
export type MScrollAreaProperties = {
  axis?: MScrollAreaAxis
  fadeEdges?: boolean
  overscroll?: 'auto' | 'contain' | 'none'
  scrollbarGutter?: 'auto' | 'stable' | 'stable both-edges'
}
export type MScrollAreaExpose = {
  viewport: HTMLDivElement | null
  scrollTo: (options?: ScrollToOptions) => void
  scrollBy: (options?: ScrollToOptions) => void
}
</script>

<script lang="ts" setup>
import { computed, onMounted, ref, useAttrs, useTemplateRef } from 'vue'

defineOptions({ inheritAttrs: false })

const {
  axis = 'block',
  fadeEdges = false,
  overscroll = 'contain',
  scrollbarGutter,
} = defineProps<MScrollAreaProperties>()

const attributes = useAttrs()
const emit = defineEmits<{
  scroll: [event: Event]
}>()
const viewportReference = useTemplateRef<HTMLDivElement>('viewport')

const canScrollBlockBefore = ref(false)
const canScrollBlockAfter = ref(false)
const canScrollInlineBefore = ref(false)
const canScrollInlineAfter = ref(false)

const scrollAreaStyle = computed(() => ({
  '--scroll-area-overscroll': overscroll,
  '--scroll-area-scrollbar-gutter': scrollbarGutter ?? (axis === 'block' ? 'stable' : 'auto'),
}))

const updateScrollState = (): void => {
  const viewport = viewportReference.value
  if (!viewport) return

  const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
  const scrollTop = Math.min(maxScrollTop, Math.max(0, viewport.scrollTop))

  const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
  const rawScrollLeft =
    getComputedStyle(viewport).direction === 'rtl' ? Math.abs(viewport.scrollLeft) : viewport.scrollLeft
  const scrollLeft = Math.min(maxScrollLeft, Math.max(0, rawScrollLeft))

  canScrollBlockBefore.value = scrollTop > 1
  canScrollBlockAfter.value = maxScrollTop - scrollTop > 1
  canScrollInlineBefore.value = scrollLeft > 1
  canScrollInlineAfter.value = maxScrollLeft - scrollLeft > 1
}

const onScroll = (event: Event): void => {
  updateScrollState()
  emit('scroll', event)
}

const scrollTo = (options: ScrollToOptions = {}): void => {
  viewportReference.value?.scrollTo(options)
}

const scrollBy = (options: ScrollToOptions = {}): void => {
  viewportReference.value?.scrollBy(options)
}

onMounted(updateScrollState)

defineExpose<MScrollAreaExpose>({
  get viewport() {
    return viewportReference.value
  },
  scrollTo,
  scrollBy,
})
</script>

<style scoped>
@layer components {
  .scroll-area {
    --scroll-area-fade-size: var(--space-xl);
    --scroll-area-fade-color: var(--surface-bg);

    position: relative;
    min-inline-size: 0;
    min-block-size: 0;
    display: flex;
    flex-direction: column;
    overflow: clip;

    & > .viewport {
      min-inline-size: 0;
      min-block-size: 0;
      flex: 1 1 auto;
      scrollbar-gutter: var(--scroll-area-scrollbar-gutter);
      scroll-padding: var(--scroll-area-scroll-padding, 0);

      & > .content {
        min-inline-size: 0;
        min-block-size: 0;
      }
    }

    &[data-axis='block'] > .viewport {
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior-y: var(--scroll-area-overscroll);
    }

    &[data-axis='inline'] > .viewport {
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-x: var(--scroll-area-overscroll);
    }

    &[data-axis='both'] > .viewport {
      overflow: auto;
      overscroll-behavior: var(--scroll-area-overscroll);
    }

    & > .edge-fade {
      position: absolute;
      z-index: 1;
      pointer-events: none;
      opacity: 0;

      transition: opacity var(--duration-sm) var(--bezier-smooth);

      &.block-before,
      &.block-after {
        inset-inline: 0;
        block-size: var(--scroll-area-fade-size);
      }

      &.inline-before,
      &.inline-after {
        inset-block: 0;
        inline-size: var(--scroll-area-fade-size);
      }

      &.block-before {
        inset-block-start: 0;
        background: linear-gradient(to bottom, var(--scroll-area-fade-color), transparent);
      }

      &.block-after {
        inset-block-end: 0;
        background: linear-gradient(to top, var(--scroll-area-fade-color), transparent);
      }

      &.inline-before {
        inset-inline-start: 0;
        background: linear-gradient(to right, var(--scroll-area-fade-color), transparent);
      }

      &.inline-after {
        inset-inline-end: 0;
        background: linear-gradient(to left, var(--scroll-area-fade-color), transparent);
      }
    }

    &:dir(rtl) > .edge-fade {
      &.inline-before {
        background: linear-gradient(to left, var(--scroll-area-fade-color), transparent);
      }

      &.inline-after {
        background: linear-gradient(to right, var(--scroll-area-fade-color), transparent);
      }
    }

    &[data-fade-edges]:is([data-axis='block'], [data-axis='both'])[data-scroll-block-before] > .edge-fade.block-before,
    &[data-fade-edges]:is([data-axis='block'], [data-axis='both'])[data-scroll-block-after] > .edge-fade.block-after,
    &[data-fade-edges]:is([data-axis='inline'], [data-axis='both'])[data-scroll-inline-before]
      > .edge-fade.inline-before,
    &[data-fade-edges]:is([data-axis='inline'], [data-axis='both'])[data-scroll-inline-after]
      > .edge-fade.inline-after {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .scroll-area > .edge-fade {
      transition: none;
    }
  }
}
</style>
