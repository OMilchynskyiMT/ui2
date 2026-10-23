<template>
  <div v-if="expanded" :style="{ blockSize: `${inlineHeight}px` }" aria-hidden="true" class="inline-placeholder" />

  <Teleport :disabled="!expanded" :to="expandedTarget ?? '#modals'">
    <section ref="viewer" v-bind="attributes" :aria-label="label" :class="{ expanded }" class="log-viewer">
      <UiCluster class="toolbar" gap="var(--space-sm) var(--space-md)">
        <UiSearchField
          v-if="searchable"
          v-model="query"
          :placeholder="searchPlaceholder"
          class="search"
          label=""
          size="small"
          variant="filled"
        />

        <UiInline v-if="searchable && query">
          <span aria-live="polite" class="match-count">
            {{ matches.length > 0 ? `${activeMatchIndex + 1} / ${matches.length}` : 'No matches' }}
          </span>
          <UiButton
            :disabled="matches.length === 0"
            :icon="ChevronUpIcon"
            aria-label="Previous match"
            layout="icon"
            size="small"
            title="Previous match"
            tone="neutral"
            variant="text"
            @click="moveMatch(-1)"
          />
          <UiButton
            :disabled="matches.length === 0"
            :icon="ChevronDownIcon"
            aria-label="Next match"
            layout="icon"
            size="small"
            title="Next match"
            tone="neutral"
            variant="text"
            @click="moveMatch(1)"
          />
        </UiInline>

        <UiCluster class="actions">
          <UiButton
            :aria-pressed="following"
            :icon="ScanEyeIcon"
            :title="following ? 'Pause following' : 'Follow latest lines'"
            :variant="following ? 'tonal' : 'text'"
            layout="adaptive"
            size="small"
            tone="neutral"
            @click="toggleFollowing"
          >
            {{ following ? 'Following' : 'Follow latest' }}
          </UiButton>
          <UiButton
            v-if="wrappable"
            :aria-pressed="wrapped"
            :icon="TextWrapIcon"
            :label="wrapped ? 'Unwrap' : 'Wrap'"
            :variant="wrapped ? 'tonal' : 'text'"
            layout="adaptive"
            size="small"
            tone="info"
            @click="wrapped = !wrapped"
          />
          <UiButton
            v-if="copyable"
            :disabled="!text || copying"
            :icon="copied ? CheckIcon : CopyIcon"
            :title="copied ? 'Log copied' : 'Copy log'"
            aria-label="Copy log"
            layout="adaptive"
            size="small"
            tone="warning"
            variant="text"
            @click="copyLog"
          >
            Copy
          </UiButton>
          <span v-if="copyable" aria-live="polite" class="copy-announcement">{{ copied ? 'Log copied' : '' }}</span>
          <UiButton
            v-if="downloadable"
            :disabled="!text && !onDownload"
            :icon="DownloadIcon"
            :loading="downloading"
            layout="adaptive"
            size="small"
            tone="primary"
            variant="text"
            @click="download"
          >
            Download
          </UiButton>
          <UiButton
            v-if="expandable || expanded"
            ref="expandButton"
            :aria-expanded="expanded"
            :aria-label="expanded ? 'Collapse log viewer' : 'Expand log viewer'"
            :icon="expanded ? Minimize2Icon : Maximize2Icon"
            :title="expanded ? 'Collapse log viewer' : 'Expand log viewer'"
            aria-haspopup="dialog"
            layout="adaptive"
            size="small"
            tone="neutral"
            variant="text"
            @click="toggleExpanded"
          >
            {{ expanded ? 'Collapse' : 'Expand' }}
          </UiButton>
        </UiCluster>
      </UiCluster>

      <p v-if="tail.truncated" class="truncated">Showing the last {{ maxLines.toLocaleString() }} lines</p>

      <UiScrollArea
        ref="scrollArea"
        v-resize="onViewportResize"
        :axis="wrapped ? 'block' : 'both'"
        class="log-scroll"
        fade-edges
        overscroll="contain"
        scrollbar-gutter="stable"
        @keydown="interruptAnimatedFollow"
        @pointerdown="interruptAnimatedFollow"
        @scroll="onScroll"
        @touchmove.passive="interruptAnimatedFollow"
        @wheel.passive="interruptAnimatedFollow"
      >
        <pre
          role="log"
          :aria-label="label"
          :class="{ wrapped }"
          aria-live="off"
          class="log-content"
        ><template v-if="selectedMatch">{{ tail.text.slice(0, selectedMatch.start) }}<mark ref="activeMark">{{ tail.text.slice(selectedMatch.start, selectedMatch.start + selectedMatch.length) }}</mark>{{ tail.text.slice(selectedMatch.start + selectedMatch.length) }}</template><template v-else>{{ tail.text || emptyText }}</template></pre>
      </UiScrollArea>
    </section>
  </Teleport>

  <UiDialog
    v-if="expandable || expanded"
    ref="expandedDialog"
    :aria-label="label"
    class="log-viewer-dialog"
    fullscreen
    @close="onExpandedClosed"
  >
    <div ref="expandedTarget" class="expanded-target" />
  </UiDialog>
</template>

<script lang="ts">
export type UiLogViewerProperties = {
  text: string
  label?: string
  filename?: string
  maxLines?: number
  searchable?: boolean
  searchPlaceholder?: string
  wrappable?: boolean
  copyable?: boolean
  downloadable?: boolean
  expandable?: boolean
  onDownload?: () => void | Promise<void>
  emptyText?: string
}
</script>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onScopeDispose, ref, useAttrs, useTemplateRef, watch } from 'vue'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  DownloadIcon,
  Maximize2Icon,
  Minimize2Icon,
  ScanEyeIcon,
  TextWrapIcon,
} from '@lucide/vue'

import { useClipboard } from '../../composables/useClipboard'
import UiButton from '../buttons/UiButton.vue'
import UiDialog, { type Exposed as DialogExposed } from '../dialog/UiDialog.vue'
import UiSearchField from '../fields/UiSearchField.vue'
import UiCluster from '../layout/UiCluster.vue'
import UiInline from '../layout/UiInline.vue'
import UiScrollArea, { type UiScrollAreaExpose } from '../layout/UiScrollArea.vue'
import { findLogMatches, isNearLogBottom, tailLog } from './logViewer.shared'

defineOptions({ inheritAttrs: false })

const attributes = useAttrs()

const {
  text,
  label = 'Log output',
  filename = 'device.log',
  maxLines = 5000,
  searchable = true,
  searchPlaceholder = 'Find in logs',
  wrappable = true,
  copyable = true,
  downloadable = true,
  expandable = false,
  onDownload,
  emptyText = 'No log entries',
} = defineProps<UiLogViewerProperties>()

const emit = defineEmits<{ 'copy-error': [error: unknown]; 'download-error': [error: unknown] }>()
const { copy, invalidate, copied, copying } = useClipboard()
let feedbackTimer: ReturnType<typeof setTimeout> | undefined

const clearFeedbackTimer = (): void => {
  if (feedbackTimer === undefined) return
  clearTimeout(feedbackTimer)
  feedbackTimer = undefined
}

onScopeDispose(clearFeedbackTimer)

watch(
  () => text,
  () => {
    clearFeedbackTimer()
    invalidate()
  }
)

const copyLog = async (): Promise<void> => {
  if (!text || copying.value) return
  clearFeedbackTimer()
  try {
    if (!(await copy(text))) return
    feedbackTimer = setTimeout(() => {
      invalidate()
      feedbackTimer = undefined
    }, 2500)
  } catch (error) {
    emit('copy-error', error)
  }
}

const following = defineModel<boolean>('follow', { default: true })
const wrapped = defineModel<boolean>('wrap', { default: false })
const query = ref('')
const activeMatchIndex = ref(0)
const scrollArea = useTemplateRef<UiScrollAreaExpose>('scrollArea')
const viewer = useTemplateRef<HTMLElement>('viewer')
const expandedDialog = useTemplateRef<DialogExposed>('expandedDialog')
const expandedTarget = useTemplateRef<HTMLDivElement>('expandedTarget')
const expandButton = useTemplateRef<{ $el: HTMLButtonElement }>('expandButton')
const expanded = ref(false)
const inlineHeight = ref(0)
let isRelocating = false
let restorationTop = 0
let restorationFrame: number | undefined

const clearRestorationFrame = (): void => {
  if (restorationFrame === undefined) return
  cancelAnimationFrame(restorationFrame)
  restorationFrame = undefined
}

onScopeDispose(clearRestorationFrame)

const activeMark = useTemplateRef<HTMLElement>('activeMark')

const tail = computed(() => tailLog(text, maxLines))
const matches = computed(() => findLogMatches(tail.value.text, query.value))
const selectedMatch = computed(() => matches.value[activeMatchIndex.value])

let isAnimatingFollow = false

const scrollToLatest = (animate = false): void => {
  const viewport = scrollArea.value?.viewport
  if (!viewport) return

  const bottom = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
  const distance = bottom - viewport.scrollTop
  if (distance <= 1) return

  if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isAnimatingFollow = false
    viewport.scrollTo({ behavior: 'instant', top: bottom })
    return
  }

  // NOTE: native smooth scroll duration depends on the distance and the browser.
  // Jump close to the end first, then animate only a short, predictable final distance o reduce huge jump
  const smoothDistance = Math.min(viewport.clientHeight / 2, 240)
  isAnimatingFollow = true
  if (distance > smoothDistance) {
    viewport.scrollTo({ behavior: 'instant', top: bottom - smoothDistance })
  }
  viewport.scrollTo({ behavior: 'smooth', top: bottom })
}

const stopAnimatedFollow = (): void => {
  if (!isAnimatingFollow) return
  isAnimatingFollow = false
  const viewport = scrollArea.value?.viewport
  if (viewport) viewport.scrollTo({ behavior: 'instant', top: viewport.scrollTop })
}

const interruptAnimatedFollow = (): void => {
  if (!isAnimatingFollow) return
  stopAnimatedFollow()
  following.value = false
}

const onScroll = (): void => {
  if (isRelocating) return
  const viewport = scrollArea.value?.viewport
  if (!viewport) return
  const atBottom = isNearLogBottom(viewport.scrollHeight, viewport.scrollTop, viewport.clientHeight)
  if (isAnimatingFollow) {
    if (atBottom) isAnimatingFollow = false
    return
  }
  if (!atBottom || !query.value) following.value = atBottom
}

const restoreScrollAfterMove = (): void => {
  const viewport = scrollArea.value?.viewport
  if (following.value) scrollToLatest()
  else viewport?.scrollTo({ behavior: 'instant', top: restorationTop })

  clearRestorationFrame()
  restorationFrame = requestAnimationFrame(() => {
    if (following.value) scrollToLatest()
    isRelocating = false
    restorationFrame = undefined
  })
}

const toggleExpanded = async (): Promise<void> => {
  if (expanded.value) {
    expandedDialog.value?.close()
    return
  }

  if (!expandedTarget.value || !expandedDialog.value) return

  const viewport = scrollArea.value?.viewport
  restorationTop = viewport?.scrollTop ?? 0
  inlineHeight.value = viewer.value?.getBoundingClientRect().height ?? 0
  isRelocating = true
  clearRestorationFrame()
  expanded.value = true
  await nextTick()
  expandedDialog.value?.show()
  restoreScrollAfterMove()
  expandButton.value?.$el.focus({ preventScroll: true })
}

const onExpandedClosed = async (): Promise<void> => {
  restorationTop = scrollArea.value?.viewport?.scrollTop ?? 0
  isRelocating = true
  clearRestorationFrame()
  expanded.value = false
  await nextTick()
  restoreScrollAfterMove()
  expandButton.value?.$el.focus({ preventScroll: true })
}

watch(
  () => expandable,
  enabled => {
    if (!enabled && expanded.value) expandedDialog.value?.close()
  }
)

const onViewportResize = (): void => {
  if (!isRelocating && following.value) scrollToLatest()
}

const toggleFollowing = (): void => {
  following.value = !following.value
}

watch(
  following,
  enabled => {
    if (enabled) scrollToLatest(true)
    else stopAnimatedFollow()
  },
  { flush: 'post' }
)

const revealMatch = (): void => {
  const viewport = scrollArea.value?.viewport
  const mark = activeMark.value
  if (!viewport || !mark) return

  const viewportRect = viewport.getBoundingClientRect()
  const markRect = mark.getBoundingClientRect()
  viewport.scrollTop += markRect.top - viewportRect.top - (viewport.clientHeight - markRect.height) / 2

  if (wrapped.value) return

  if (markRect.left < viewportRect.left) viewport.scrollLeft += markRect.left - viewportRect.left
  if (markRect.right > viewportRect.right) viewport.scrollLeft += markRect.right - viewportRect.right
}

const moveMatch = (step: number): void => {
  if (matches.value.length === 0) return
  following.value = false
  activeMatchIndex.value = (activeMatchIndex.value + step + matches.value.length) % matches.value.length
  void nextTick(revealMatch)
}

watch(query, () => {
  activeMatchIndex.value = 0
  if (!query.value) return

  following.value = false
  void nextTick(revealMatch)
})

watch(matches, current => {
  if (activeMatchIndex.value >= current.length) activeMatchIndex.value = Math.max(0, current.length - 1)
})

watch(
  () => [tail.value.text, wrapped.value],
  () => {
    if (following.value) scrollToLatest()
  },
  { flush: 'post' }
)

onMounted(() => {
  if (following.value) scrollToLatest()
})

const downloading = ref(false)

const download = async (): Promise<void> => {
  if (downloading.value) return
  downloading.value = true

  try {
    if (onDownload) {
      await onDownload()
    } else {
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
      try {
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = filename
        document.body.append(anchor)
        try {
          anchor.click()
        } finally {
          anchor.remove()
        }
      } finally {
        // NOTE: allow the browser to start the download before releasing the object URL
        setTimeout(() => URL.revokeObjectURL(url), 0)
      }
    }
  } catch (error) {
    emit('download-error', error)
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
@layer components {
  .inline-placeholder {
    min-inline-size: 0;
  }

  .expanded-target {
    min-inline-size: 0;
    min-block-size: 0;
    block-size: 100%;
    display: flex;
    flex-direction: column;
  }

  .log-viewer {
    --log-viewer-height: 24rem;
    --log-viewer-background: var(--surface-container-low);
    --log-viewer-border-color: var(--divider-color);

    display: flex;
    flex-direction: column;
    min-inline-size: 0;
    overflow: hidden;
    border: var(--border-width-thin) solid var(--log-viewer-border-color);
    border-radius: var(--radius-lg);
    background: var(--log-viewer-background);

    & > .toolbar {
      padding: var(--space-sm) var(--space-md);
      border-block-end: var(--border-width-thin) solid var(--log-viewer-border-color);

      & > .search {
        flex: 1 1 13rem;
        max-inline-size: 24rem;
      }

      & > .actions {
        margin-inline-start: auto;

        & > .copy-announcement {
          position: absolute;
          inline-size: 1px;
          block-size: 1px;
          overflow: hidden;
          clip-path: inset(50%);
          white-space: nowrap;
        }
      }

      & .match-count {
        color: var(--text-color-dimmed);
        font-size: var(--font-size-sm);
        white-space: nowrap;
      }
    }

    & > .truncated {
      padding: var(--space-xs) var(--space-md);
      border-block-end: var(--border-width-thin) solid var(--log-viewer-border-color);
      color: var(--text-color-dimmed);
      font-size: var(--font-size-sm);
      white-space: nowrap;
    }

    & > .log-scroll {
      --scroll-area-fade-color: var(--log-viewer-background);

      block-size: var(--log-viewer-height);

      & .log-content {
        display: block;
        min-inline-size: 100%;
        inline-size: max-content;
        min-block-size: 100%;
        padding: var(--space-md);
        white-space: pre;
        font: var(--font-weight-normal) var(--font-size-sm) / 1.6 var(--font-mono);
        color: var(--text-color);
        tab-size: 4;

        &.wrapped {
          inline-size: 100%;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        & > mark {
          color: var(--text-color-strong);
          background: var(--tone-primary-container);
          border-radius: var(--radius-xs);
          outline: var(--border-width-thin) solid var(--tone-primary);
        }
      }
    }

    &.expanded {
      min-block-size: 0;
      block-size: 100%;
      flex: 1 1 auto;
      border: 0;
      border-radius: 0;

      & > .toolbar {
        padding-block-start: max(var(--space-sm), var(--safe-area-top));
        padding-inline-start: max(var(--space-md), var(--safe-area-left));
        padding-inline-end: max(var(--space-md), var(--safe-area-right));
      }

      & > .log-scroll {
        min-block-size: 0;
        block-size: 0;
        flex: 1 1 auto;
      }

      & .log-content {
        padding-block-end: max(var(--space-md), var(--safe-area-bottom));
        padding-inline-start: max(var(--space-md), var(--safe-area-left));
        padding-inline-end: max(var(--space-md), var(--safe-area-right));
      }
    }
  }
}
</style>
