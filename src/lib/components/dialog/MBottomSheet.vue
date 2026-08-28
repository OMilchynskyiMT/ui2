<template>
  <MDialog
    ref="dialog"
    v-bind="attributes"
    :aria-describedby="description ? descriptionId : undefined"
    :aria-labelledby="hasHeading ? headingId : undefined"
    :persistent="persistent"
    :style="viewportStyle"
    :teleport-to="teleportTo"
    class="bottom-sheet"
    @cancel="emit('cancel', $event)"
    @close="emit('close')"
    @closing="emit('closing')"
    @show="emit('show', $event)"
  >
    <section class="sheet">
      <header v-if="hasHeader" class="header">
        <div v-if="hasHeading || description" class="heading">
          <div v-if="hasHeading" :id="headingId" class="title">
            <slot name="title">
              <h2>{{ title }}</h2>
            </slot>
          </div>

          <p v-if="description" :id="descriptionId" class="description">{{ description }}</p>
        </div>

        <slot :close="close" name="header-actions">
          <MButton
            v-if="closeButton"
            aria-label="Close"
            style="--block-size: var(--touch-target-min)"
            tone="neutral"
            variant="icon"
            @click="close"
          >
            <MIcon :icon="XIcon" size="1rem" />
          </MButton>
        </slot>
      </header>

      <MScrollArea class="content" fade-edges overscroll="contain">
        <div class="content-layout">
          <slot :close="close" />
        </div>
      </MScrollArea>

      <footer v-if="slots.actions" class="footer">
        <MBottomActions :adaptive="actionsAdaptive" :sticky="false">
          <slot :close="close" name="actions" />
        </MBottomActions>
      </footer>
    </section>
  </MDialog>
</template>

<script lang="ts">
import type { TeleportProps } from 'vue'

export type MBottomSheetProperties = {
  title?: string
  description?: string
  headingId?: string
  descriptionId?: string
  persistent?: boolean
  closeButton?: boolean
  actionsAdaptive?: boolean
  teleportTo?: TeleportProps['to']
}

export type MBottomSheetExposed = {
  show: (isModal?: boolean) => void
  close: () => void
  isVisible: () => boolean
}
</script>

<script lang="ts" setup>
import { computed, useAttrs, useSlots, useTemplateRef } from 'vue'
import { XIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'
import { useVisualViewport } from '@/composables/useVisualViewport'

import MButton from '../buttons/MButton.vue'
import MBottomActions from '../layout/MBottomActions.vue'
import MScrollArea from '../layout/MScrollArea.vue'
import MIcon from '../MIcon.vue'
import MDialog, { type Exposed as DialogExposed } from './MDialog.vue'

defineOptions({ inheritAttrs: false })

const attributes = useAttrs()
const slots = useSlots()
const visualViewport = useVisualViewport()

const {
  title,
  description,
  headingId = useId(),
  descriptionId = useId(),
  persistent = false,
  closeButton = true,
  actionsAdaptive = true,
  teleportTo = '#modals',
} = defineProps<MBottomSheetProperties>()

const emit = defineEmits<{
  show: [modal: boolean]
  closing: []
  close: []
  cancel: [event: Event]
}>()

const dialog = useTemplateRef<DialogExposed>('dialog')

const hasHeading = computed(() => Boolean(slots.title ?? title))
const hasHeader = computed(() => Boolean((description ?? closeButton) || hasHeading.value || slots['header-actions']))
const viewportStyle = computed(() => {
  const height = visualViewport.height.value
  if (!visualViewport.supported.value || height <= 0) return {}
  const insetBottom = Math.max(0, document.documentElement.clientHeight - visualViewport.offsetTop.value - height)
  return {
    '--bottom-sheet-visual-height': `${height}px`,
    '--bottom-sheet-visual-inset-bottom': `${insetBottom}px`,
  }
})

const show = (isModal = true): void => dialog.value?.show(isModal)
const close = (): void => dialog.value?.close()
const isVisible = (): boolean => dialog.value?.isVisible() ?? false

defineExpose<MBottomSheetExposed>({ show, close, isVisible })
</script>

<style>
@layer components {
  dialog.bottom-sheet {
    --dialog-width: min(100%, var(--bottom-sheet-width, 42rem));
    --initial-translate-y: 100%;
    --outer-margin: 0px;

    inset-block-start: auto;
    inset-block-end: var(--bottom-sheet-visual-inset-bottom, 0px);
    inset-inline: 0;
    margin-block: 0;
    margin-inline: auto;

    inline-size: var(--dialog-width);
    max-inline-size: 100%;
    max-block-size: min(var(--bottom-sheet-max-height, 85dvh), var(--bottom-sheet-visual-height, 100dvh));

    border-end-start-radius: 0;
    border-end-end-radius: 0;
    border-start-start-radius: var(--bottom-sheet-radius, var(--radius-xl));
    border-start-end-radius: var(--bottom-sheet-radius, var(--radius-xl));

    & > .surface {
      max-block-size: inherit;
      overflow: clip;
    }
  }
}
</style>

<style scoped>
@layer components {
  .sheet {
    min-block-size: 0;
    max-block-size: inherit;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    overflow: clip;
    background-color: var(--bottom-sheet-bg, var(--surface-bg));

    & > .header {
      min-inline-size: 0;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-md);
      padding: var(--bottom-sheet-padding-block, var(--space-md))
        max(var(--bottom-sheet-padding-inline, var(--space-md)), var(--safe-area-right))
        var(--bottom-sheet-padding-block, var(--space-md))
        max(var(--bottom-sheet-padding-inline, var(--space-md)), var(--safe-area-left));
      border-block-end: 1px solid var(--divider-color);

      & > .heading {
        min-inline-size: 0;
        display: grid;
        gap: var(--space-xxs);

        & > .title {
          &,
          & > h2 {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-semibold);
          }
        }

        & > .description {
          color: var(--text-color-dimmed);
          font-size: var(--font-size-sm);
        }
      }
    }

    & > .content {
      min-block-size: 0;
      --scroll-area-fade-color: var(--bottom-sheet-bg, var(--surface-bg));

      & .content-layout {
        padding: var(--bottom-sheet-content-padding-block, var(--space-lg))
          max(var(--bottom-sheet-content-padding-inline, var(--space-md)), var(--safe-area-right))
          var(--bottom-sheet-content-padding-block, var(--space-lg))
          max(var(--bottom-sheet-content-padding-inline, var(--space-md)), var(--safe-area-left));
      }
    }

    & > .footer {
      padding: var(--bottom-sheet-footer-padding-block, var(--space-md))
        max(var(--bottom-sheet-footer-padding-inline, var(--space-md)), var(--safe-area-right))
        max(var(--bottom-sheet-footer-padding-block, var(--space-md)), var(--safe-area-bottom))
        max(var(--bottom-sheet-footer-padding-inline, var(--space-md)), var(--safe-area-left));
      border-block-start: 1px solid var(--divider-color);
    }
  }
}
</style>
