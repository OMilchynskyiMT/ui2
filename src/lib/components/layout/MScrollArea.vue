<template>
  <div
    v-bind="attributes"
    :data-fade-edges="fadeEdges || undefined"
    :data-scroll-after="canScrollAfter || undefined"
    :data-scroll-before="canScrollBefore || undefined"
    class="scroll-area"
    :style="scrollAreaStyle"
  >
    <div ref="viewport" class="viewport" @scroll.passive="onScroll">
      <div ref="content" class="content">
        <slot />
      </div>
    </div>

    <div aria-hidden="true" class="edge-fade before" />
    <div aria-hidden="true" class="edge-fade after" />
  </div>
</template>

<script lang="ts">
export type MScrollAreaProperties = {
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useTemplateRef } from 'vue'

defineOptions({ inheritAttrs: false })

const {
  fadeEdges = false,
  overscroll = 'contain',
  scrollbarGutter = 'stable',
} = defineProps<MScrollAreaProperties>()

const attributes = useAttrs()
const emit = defineEmits<{
  scroll: [event: Event]
}>()
const viewportReference = useTemplateRef<HTMLDivElement>('viewport')
const contentReference = useTemplateRef<HTMLDivElement>('content')

const canScrollBefore = ref(false)
const canScrollAfter = ref(false)

const scrollAreaStyle = computed(() => ({
  '--scroll-area-overscroll': overscroll,
  '--scroll-area-scrollbar-gutter': scrollbarGutter,
}))

const updateScrollState = (): void => {
  const viewport = viewportReference.value
  if (!viewport) return

  const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
  const scrollTop = Math.min(maxScrollTop, Math.max(0, viewport.scrollTop))

  canScrollBefore.value = scrollTop > 1
  canScrollAfter.value = maxScrollTop - scrollTop > 1
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

let resizeObserver: ResizeObserver | undefined

onMounted(async () => {
  await nextTick()
  updateScrollState()

  resizeObserver = new ResizeObserver(updateScrollState)
  if (viewportReference.value) resizeObserver.observe(viewportReference.value)
  if (contentReference.value) resizeObserver.observe(contentReference.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

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
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior-y: var(--scroll-area-overscroll);
      scrollbar-gutter: var(--scroll-area-scrollbar-gutter);

      & > .content {
        min-inline-size: 0;
      }
    }

    & > .edge-fade {
      position: absolute;
      z-index: 1;
      inset-inline: 0;
      block-size: var(--scroll-area-fade-size);
      pointer-events: none;
      opacity: 0;

      transition: opacity var(--duration-sm) var(--bezier-smooth);

      &.before {
        inset-block-start: 0;
        background: linear-gradient(to bottom, var(--scroll-area-fade-color), transparent);
      }

      &.after {
        inset-block-end: 0;
        background: linear-gradient(to top, var(--scroll-area-fade-color), transparent);
      }
    }

    &[data-fade-edges][data-scroll-before] > .edge-fade.before,
    &[data-fade-edges][data-scroll-after] > .edge-fade.after {
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
