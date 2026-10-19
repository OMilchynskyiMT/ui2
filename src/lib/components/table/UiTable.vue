<template>
  <div
    :data-compact="compact"
    :data-dragging="draggingSourceIndex !== null || undefined"
    :data-layout="layout"
    :data-mode="mode"
    :data-sticky-header="stickyHeader || undefined"
    class="table"
  >
    <UiScrollArea ref="scrollArea" axis="both" class="scroll" scrollbar-gutter="auto">
      <div :data-reorder-clip="reorderable || undefined" class="table-content">
        <table ref="table" :aria-busy="loading || undefined" :aria-label="ariaLabel" class="content">
          <caption v-if="caption || slots.caption">
            <slot name="caption">{{ caption }}</slot>
          </caption>

          <thead v-if="columns.length > 0">
            <tr>
              <th v-if="reorderable" class="header-cell reorder-cell" scope="col">
                <span class="visually-hidden">Row order</span>
              </th>

              <th
                v-for="column in columns"
                :key="column.key"
                :aria-sort="getAriaSort(column)"
                :data-align="column.headerAlign ?? column.align ?? 'start'"
                :data-compact="column.compact ?? 'keep'"
                :data-type="column.type ?? 'text'"
                :style="getColumnStyle(column)"
                class="header-cell"
                scope="col"
              >
                <slot :column="column" :name="getHeaderSlotName(column)" :sort="effectiveSort">
                  <button
                    v-if="column.sortable && !reorderable"
                    :aria-label="getSortLabel(column)"
                    :data-direction="getSortDirection(column)"
                    class="sort-button"
                    type="button"
                    @click="toggleSort(column)"
                  >
                    <span>{{ column.label }}</span>
                    <UiIcon
                      :icon="ChevronUpIcon"
                      aria-hidden="true"
                      class="sort-indicator"
                      color="var(--table-sort-indicator-color)"
                      size="1rem"
                    />
                  </button>

                  <template v-else>{{ column.label }}</template>
                </slot>
              </th>
            </tr>
          </thead>

          <tbody v-if="loading">
            <tr>
              <td :colspan="columnSpan" class="state loading">
                <div class="loading">
                  <slot name="loading">
                    <UiSpinner :stroke-width="4" size="1.5rem" />
                    <span>{{ loadingLabel }}</span>
                  </slot>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="rows.length === 0">
            <tr>
              <td :colspan="columnSpan" class="state empty">
                <slot name="empty">{{ emptyLabel }}</slot>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <template v-for="entry in displayedRows" :key="getRowKey(entry.row, entry.sourceIndex)">
              <tr
                :data-dragging="draggingSourceIndex === entry.sourceIndex || undefined"
                :data-drop-after="isDropAfter(entry.sourceIndex) || undefined"
                :data-drop-before="isDropBefore(entry.sourceIndex) || undefined"
                :data-picked="selectedRowIndex === entry.sourceIndex || undefined"
                :data-placed="placedRowKey === getRowKey(entry.row, entry.sourceIndex) || undefined"
                :data-row-index="entry.sourceIndex"
                :data-shift="getRowShift(entry.sourceIndex)"
                class="row"
                @animationend="onPlacedAnimationEnd"
              >
                <td v-if="reorderable" class="cell reorder-cell">
                  <button
                    :aria-describedby="reorderInstructionsId"
                    :aria-keyshortcuts="canReorder ? 'Alt+ArrowUp Alt+ArrowDown' : undefined"
                    :aria-label="getReorderLabel(entry.sourceIndex)"
                    :aria-pressed="selectedRowIndex === entry.sourceIndex"
                    :disabled="!canReorder"
                    class="reorder-handle"
                    type="button"
                    @click="onReorderClick($event, entry.sourceIndex)"
                    @dragstart.prevent
                    @keydown="onReorderKeydown($event, entry.sourceIndex)"
                    @lostpointercapture="onPointerCancel"
                    @pointercancel="onPointerCancel"
                    @pointerdown="onPointerDown($event, entry.sourceIndex)"
                    @pointermove="onPointerMove"
                    @pointerup="onPointerUp"
                  >
                    <UiIcon :icon="GripVerticalIcon" aria-hidden="true" size="1.125rem" />
                  </button>
                </td>

                <component
                  :is="column.rowHeader ? 'th' : 'td'"
                  v-for="column in columns"
                  :key="column.key"
                  :data-align="column.align ?? 'start'"
                  :data-compact="column.compact ?? 'keep'"
                  :data-type="column.type ?? 'text'"
                  :data-wrap="column.wrap ?? true"
                  :scope="column.rowHeader ? 'row' : undefined"
                  :style="getColumnStyle(column)"
                  class="cell"
                >
                  <slot
                    :column="column"
                    :name="getCellSlotName(column)"
                    :row="entry.row"
                    :row-index="entry.sourceIndex"
                    :value="getCellValue(entry.row, entry.sourceIndex, column)"
                  >
                    {{ getCellText(entry.row, entry.sourceIndex, column) }}
                  </slot>
                </component>
              </tr>

              <tr
                v-if="mode === 'details' && detailColumns.length > 0"
                :data-dragging="draggingSourceIndex === entry.sourceIndex || undefined"
                :data-drop-after="isDropAfter(entry.sourceIndex) || undefined"
                :data-row-index="entry.sourceIndex"
                :data-shift="getRowShift(entry.sourceIndex)"
                class="details-row"
              >
                <td :colspan="columnSpan" class="details-cell">
                  <slot :columns="detailColumns" :row="entry.row" :row-index="entry.sourceIndex" name="details">
                    <dl class="details-list">
                      <div v-for="column in detailColumns" :key="column.key" class="details-item">
                        <dt>{{ column.label }}</dt>
                        <dd>
                          <slot
                            :column="column"
                            :name="getDetailSlotName(column)"
                            :row="entry.row"
                            :row-index="entry.sourceIndex"
                            :value="getCellValue(entry.row, entry.sourceIndex, column)"
                          >
                            {{ getCellText(entry.row, entry.sourceIndex, column) }}
                          </slot>
                        </dd>
                      </div>
                    </dl>
                  </slot>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </UiScrollArea>

    <UiCluster v-if="pagination && rows.length > 0" align="center" class="table-footer" justify="between">
      <span role="status" class="page-summary"> {{ firstVisibleRow }}-{{ lastVisibleRow }} of {{ rows.length }} </span>

      <UiPagination
        v-if="pageCount > 1"
        v-model="page"
        :aria-label="ariaLabel ? `${ariaLabel} pages` : 'Table pages'"
        :disabled="loading"
        :page-count="pageCount"
        :sibling-count="0"
      />

      <UiSelect
        v-if="pageSizeOptions !== false"
        v-model="pageSize"
        :disabled="loading"
        :options="availablePageSizes"
        class="page-size-select"
        label="Rows per page"
        size="small"
      />
    </UiCluster>

    <template v-if="reorderable">
      <span :id="reorderInstructionsId" class="visually-hidden">
        Drag to reorder; or select this handle, then another row handle to move without dragging. Alt+ArrowUp and
        Alt+ArrowDown move one position{{ pagination ? ' within the visible page' : '' }}. Escape cancels selection or
        dragging.
      </span>
      <span aria-live="polite" class="visually-hidden">{{ reorderAnnouncement }}</span>
    </template>
  </div>
</template>

<script generic="Row" lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'
import { ChevronUpIcon, GripVerticalIcon } from '@lucide/vue'

import UiSelect from '../fields/UiSelect.vue'
import UiCluster from '../layout/UiCluster.vue'
import UiScrollArea, { type UiScrollAreaExpose } from '../layout/UiScrollArea.vue'
import UiPagination from '../navigation/UiPagination.vue'
import UiSpinner from '../progress/UiSpinner.vue'
import UiIcon from '../UiIcon.vue'
import {
  getDisplayedTableRows,
  getTableAriaSort,
  getTableCellSlotName,
  getTableCellText,
  getTableCellValue,
  getTableColumnStyle,
  getTableDetailSlotName,
  getTableHeaderSlotName,
  getTablePage,
  getTablePageCount,
  getTablePageRows,
  getTablePageSize,
  getTableReorderShift,
  getTableReorderTargetIndex,
  getTableReorderVisibleGapIndex,
  getTableRowKey,
  getTableSortDirection,
  getTableSortLabel,
  reorderTableRows,
} from './table.shared'
import type { TableColumn, TableProperties, TableRowReorderEvent, TableSlots, TableSort } from './table.types'

type DragSession = {
  pointerId: number
  handle: HTMLButtonElement
  row: HTMLTableRowElement
  detailsRow: HTMLTableRowElement | null
  sourceIndex: number
  startY: number
  clientY: number
  grabOffsetY: number
  originY: number
  height: number
  maxScrollTop: number
  centers: number[]
  active: boolean
}

const DRAG_THRESHOLD = 5
const TOUCH_DRAG_THRESHOLD = 8
const SCROLL_EDGE = 56
const MAX_SCROLL_SPEED = 720 // px/s

const {
  columns,
  rows,
  rowKey,
  ariaLabel,
  caption,
  emptyLabel = 'No entries found',
  loading = false,
  loadingLabel = 'Loading…',
  compact = 'auto',
  layout = 'auto',
  mode = 'scroll',
  reorderable = false,
  pagination = false,
  pageSizeOptions = [10, 25, 50, 100],
  sortMode = 'client',
  stickyHeader = false,
} = defineProps<Omit<TableProperties<Row>, 'sort' | 'page' | 'pageSize'>>()

const emit = defineEmits<{
  reorder: [event: TableRowReorderEvent<Row>]
  'update:rows': [rows: Row[]]
}>()
const sort = defineModel<TableSort | null>('sort', { default: null })
const page = defineModel<number>('page', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 10 })
const slots = defineSlots<TableSlots<Row>>()
const reorderInstructionsId = useId()
const scrollAreaReference = useTemplateRef<UiScrollAreaExpose>('scrollArea')
const tableReference = useTemplateRef<HTMLTableElement>('table')

let drag: DragSession | undefined
let frame: number | undefined
let previousFrameTime: number | undefined
let geometryObserver: ResizeObserver | undefined
const draggingSourceIndex = ref<number | null>(null)
const dropGapIndex = ref<number | null>(null)
const selectedRowIndex = ref<number | null>(null)
const reorderAnnouncement = ref('')
const placedRowKey = ref<PropertyKey | null>(null)

const effectiveSort = computed(() => (reorderable ? null : sort.value))
const columnSpan = computed(() => Math.max(columns.length + Number(reorderable), 1))
const detailColumns = computed(() => columns.filter(column => column.compact === 'details'))
const sortedRows = computed(() => getDisplayedTableRows(rows, columns, effectiveSort.value, sortMode))
const normalizedPageSize = computed(() => getTablePageSize(pageSize.value))
const pageCount = computed(() => getTablePageCount(rows.length, normalizedPageSize.value))
const currentPage = computed(() => getTablePage(page.value, pageCount.value))
const firstIndex = computed(() => (pagination ? (currentPage.value - 1) * normalizedPageSize.value : 0))
const displayedRows = computed(() =>
  pagination ? getTablePageRows(sortedRows.value, currentPage.value, normalizedPageSize.value) : sortedRows.value
)
const firstVisibleRow = computed(() => firstIndex.value + 1)
const lastVisibleRow = computed(() => firstIndex.value + displayedRows.value.length)
const canReorder = computed(() => displayedRows.value.length > 1)
const availablePageSizes = computed(() => {
  const sizes = pageSizeOptions === false ? [] : pageSizeOptions
  return [...new Set([...sizes, normalizedPageSize.value].filter(size => Number.isSafeInteger(size) && size > 0))]
    .toSorted((a, b) => a - b)
    .map(size => ({ value: size, title: String(size) }))
})

watch(
  pageCount,
  () => {
    if (pagination && page.value !== currentPage.value) page.value = currentPage.value
  },
  { immediate: true }
)
watch(
  pageSize,
  value => {
    const normalized = getTablePageSize(value)
    if (normalized !== value) pageSize.value = normalized
  },
  { immediate: true }
)
watch(pageSize, () => {
  if (pagination) page.value = 1
})
watch(sort, () => {
  if (pagination) page.value = 1
})
watch(
  [currentPage, normalizedPageSize],
  () => {
    if (pagination) scrollAreaReference.value?.viewport?.scrollTo({ top: 0 })
  },
  { flush: 'post' }
)
const dropTargetIndex = computed(() => {
  if (draggingSourceIndex.value === null || dropGapIndex.value === null) return null
  return getTableReorderTargetIndex(rows.length, draggingSourceIndex.value, dropGapIndex.value)
})
const activeDropGap = computed(() =>
  dropTargetIndex.value !== null && dropTargetIndex.value !== draggingSourceIndex.value ? dropGapIndex.value : null
)

const getColumnStyle = getTableColumnStyle<Row>
const getCellValue = getTableCellValue<Row>
const getCellText = getTableCellText<Row>
const getHeaderSlotName = getTableHeaderSlotName<Row>
const getCellSlotName = getTableCellSlotName<Row>
const getDetailSlotName = getTableDetailSlotName<Row>
const getRowKey = (row: Row, rowIndex: number): PropertyKey => getTableRowKey(row, rowIndex, rowKey)
const getSortDirection = (column: TableColumn<Row>) => getTableSortDirection(column, effectiveSort.value)
const getAriaSort = (column: TableColumn<Row>) => getTableAriaSort(column, effectiveSort.value)
const getSortLabel = (column: TableColumn<Row>): string => getTableSortLabel(column, effectiveSort.value)
const getReorderLabel = (index: number): string => {
  const selected = selectedRowIndex.value
  if (selected === index) return `Cancel moving row ${index + 1}`
  return selected === null
    ? `Select row ${index + 1} of ${rows.length} to move`
    : `Move selected row to position ${index + 1} of ${rows.length}`
}
const getRowShift = (index: number): 'up' | 'down' | undefined =>
  draggingSourceIndex.value === null || dropTargetIndex.value === null
    ? undefined
    : getTableReorderShift(draggingSourceIndex.value, dropTargetIndex.value, index)
const isDropBefore = (index: number): boolean => activeDropGap.value === index
const isDropAfter = (index: number): boolean =>
  activeDropGap.value === firstIndex.value + displayedRows.value.length && index === lastVisibleRow.value - 1

const toggleSort = (column: TableColumn<Row>): void => {
  if (reorderable) return
  sort.value = {
    column: column.key,
    direction: getSortDirection(column) === 'asc' ? 'desc' : 'asc',
  }
}

const emitReorder = (fromIndex: number, toIndex: number): void => {
  if (fromIndex === toIndex) return
  const row = rows[fromIndex]
  if (row === undefined) return

  const reorderedRows = reorderTableRows(rows, fromIndex, toIndex)
  placedRowKey.value = null

  emit('update:rows', reorderedRows)
  emit('reorder', { row, fromIndex, toIndex, rows: reorderedRows })

  reorderAnnouncement.value = `Moved row from position ${fromIndex + 1} to ${toIndex + 1}`
  void nextTick(() => {
    if (!drag && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      placedRowKey.value = getRowKey(row, toIndex)
    }
  })
}

const onPlacedAnimationEnd = (event: AnimationEvent): void => {
  if (event.animationName === 'table-row-placed') placedRowKey.value = null
}

const selectOrPlaceRow = (index: number): void => {
  const source = selectedRowIndex.value
  selectedRowIndex.value = null
  if (source === null) {
    selectedRowIndex.value = index
    reorderAnnouncement.value = `Row ${index + 1} selected. Activate another row handle to move it, or Escape to cancel.`
  } else if (source === index) {
    reorderAnnouncement.value = 'Row movement cancelled'
  } else {
    emitReorder(source, index)
  }
}

const onReorderClick = (event: MouseEvent, index: number): void => {
  // INFO: pointer activation is handled on pointerup; a real keyboard or assistive
  // technology click (detail === 0) is handled here exactly once
  if (!drag && event.detail === 0) selectOrPlaceRow(index)
}

const onReorderKeydown = (event: KeyboardEvent, index: number): void => {
  if (event.key === 'Escape') {
    if (drag?.active || selectedRowIndex.value !== null) {
      event.preventDefault()
      reorderAnnouncement.value = 'Row movement cancelled'
    }
    if (drag?.active) {
      resetDrag()
    } else if (selectedRowIndex.value !== null) {
      selectedRowIndex.value = null
    }
    return
  }

  if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !canReorder.value) return
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return

  event.preventDefault()
  selectedRowIndex.value = null
  const next = Math.max(
    firstIndex.value,
    Math.min(lastVisibleRow.value - 1, index + (event.key === 'ArrowUp' ? -1 : 1))
  )
  emitReorder(index, next)
}

const getVisibleTop = (viewport: HTMLDivElement): number => {
  const bounds = viewport.getBoundingClientRect()
  const headerBottom = tableReference.value?.tHead?.getBoundingClientRect().bottom ?? bounds.top
  return Math.max(bounds.top, Math.min(headerBottom, bounds.bottom))
}

const stopFrame = (): void => {
  if (frame !== undefined) cancelAnimationFrame(frame)
  frame = undefined
  previousFrameTime = undefined
}

const queueFrame = (): void => {
  frame ??= requestAnimationFrame(updateFrame)
}

const resetDrag = (): void => {
  stopFrame()
  geometryObserver?.disconnect()
  geometryObserver = undefined
  document.removeEventListener('scroll', queueFrame, true)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  removeEventListener('blur', resetDrag)
  removeEventListener('resize', resetDrag)
  removeEventListener('keydown', onGlobalKeydown)
  const session = drag
  drag = undefined
  draggingSourceIndex.value = null
  dropGapIndex.value = null
  tableReference.value?.style.removeProperty('--table-drag-item-size')
  if (!session) return
  session.row.style.removeProperty('--translate-y')
  session.detailsRow?.style.removeProperty('--translate-y')
  if (session.handle.hasPointerCapture(session.pointerId)) session.handle.releasePointerCapture(session.pointerId)
}

const onVisibilityChange = (): void => {
  if (document.hidden) resetDrag()
}

const onGlobalKeydown = (event: KeyboardEvent): void => {
  if (event.key !== 'Escape') return
  event.preventDefault()
  event.stopPropagation()
  resetDrag()
  reorderAnnouncement.value = 'Row movement cancelled'
}

const activateDrag = (session: DragSession): void => {
  const viewport = scrollAreaReference.value?.viewport
  const table = tableReference.value
  const body = table?.tBodies.item(0)
  if (!viewport || !table || !body) return
  const viewportTop = viewport.getBoundingClientRect().top
  const contentOffset = viewport.scrollTop - viewportTop
  const bounds = session.row.getBoundingClientRect()
  const details = session.detailsRow?.getClientRects().length ? session.detailsRow.getBoundingClientRect() : null

  session.grabOffsetY = session.startY - bounds.top
  session.originY = bounds.top + contentOffset
  session.height = (details?.bottom ?? bounds.bottom) - bounds.top
  session.maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
  session.centers = [...body.querySelectorAll<HTMLTableRowElement>(':scope > tr.row')].map(row => {
    const rect = row.getBoundingClientRect()
    const following = row.nextElementSibling
    const detailBounds =
      following?.matches('.details-row') && following.getClientRects().length > 0
        ? following.getBoundingClientRect()
        : null
    return (rect.top + (detailBounds?.bottom ?? rect.bottom)) / 2 + contentOffset
  })

  const measured = new Map<Element, { width: number; height: number }>()
  for (const element of [viewport, ...table.rows, ...(table.caption ? [table.caption] : [])]) {
    const { width, height } = element.getBoundingClientRect()
    measured.set(element, { width, height })
  }

  geometryObserver = new ResizeObserver(entries => {
    if (drag !== session) return
    for (const { target } of entries) {
      const initial = measured.get(target)
      if (!initial) continue
      const { width, height } = target.getBoundingClientRect()
      if (Math.abs(width - initial.width) > 0.5 || Math.abs(height - initial.height) > 0.5) {
        resetDrag()
        break
      }
    }
  })

  for (const element of measured.keys()) geometryObserver.observe(element)

  session.active = true
  selectedRowIndex.value = null
  draggingSourceIndex.value = session.sourceIndex
  table.style.setProperty('--table-drag-item-size', `${session.height}px`)
  document.addEventListener('scroll', queueFrame, { capture: true })
  document.addEventListener('visibilitychange', onVisibilityChange)
  addEventListener('blur', resetDrag)
  addEventListener('resize', resetDrag)
  addEventListener('keydown', onGlobalKeydown)
}

const updatePosition = (session: DragSession, viewport: HTMLDivElement): void => {
  const bounds = viewport.getBoundingClientRect()
  const top = getVisibleTop(viewport)
  const position = Math.min(
    Math.max(session.clientY - session.grabOffsetY, top),
    Math.max(top, bounds.bottom - session.height)
  )
  const naturalTop = bounds.top + session.originY - viewport.scrollTop
  const offset = position - naturalTop
  session.row.style.setProperty('--translate-y', `${offset}px`)
  session.detailsRow?.style.setProperty('--translate-y', `${offset}px`)

  dropGapIndex.value = resolveGap(session, viewport, bounds, top)
}

const resolveGap = (session: DragSession, viewport: HTMLDivElement, bounds: DOMRect, top: number): number => {
  return (
    getTableReorderVisibleGapIndex(
      session.centers,
      session.clientY,
      top,
      bounds.bottom,
      bounds.top,
      viewport.scrollTop
    ) + firstIndex.value
  )
}

const updateFrame = (time: number): void => {
  frame = undefined
  const session = drag
  const viewport = scrollAreaReference.value?.viewport
  if (!viewport || !session?.active) return

  const bounds = viewport.getBoundingClientRect()
  const top = getVisibleTop(viewport)
  const distanceToTop = Math.max(0, session.clientY - top)
  const distanceToBottom = Math.max(0, bounds.bottom - session.clientY)
  const direction =
    distanceToTop < SCROLL_EDGE
      ? -(1 - distanceToTop / SCROLL_EDGE)
      : distanceToBottom < SCROLL_EDGE
        ? 1 - distanceToBottom / SCROLL_EDGE
        : 0
  const elapsed = previousFrameTime === undefined ? 16 : Math.min(40, time - previousFrameTime)
  previousFrameTime = time
  const scrollTop = viewport.scrollTop
  const nextScrollTop = Math.max(
    0,
    Math.min(session.maxScrollTop, scrollTop + (direction * MAX_SCROLL_SPEED * elapsed) / 1000)
  )
  if (nextScrollTop !== scrollTop) viewport.scrollTop = nextScrollTop

  updatePosition(session, viewport)
  if (scrollTop === viewport.scrollTop) {
    previousFrameTime = undefined
  } else {
    queueFrame()
  }
}

const onPointerDown = (event: PointerEvent, sourceIndex: number): void => {
  if (drag || !event.isPrimary || event.button !== 0 || !canReorder.value) return
  if (!(event.currentTarget instanceof HTMLButtonElement)) return
  const row = event.currentTarget.closest<HTMLTableRowElement>('tr.row')
  if (!row || !scrollAreaReference.value?.viewport) return

  event.currentTarget.setPointerCapture(event.pointerId)
  drag = {
    pointerId: event.pointerId,
    handle: event.currentTarget,
    row,
    detailsRow: row.nextElementSibling?.matches('.details-row')
      ? (row.nextElementSibling as HTMLTableRowElement)
      : null,
    sourceIndex,
    startY: event.clientY,
    clientY: event.clientY,
    grabOffsetY: 0,
    originY: 0,
    height: 0,
    maxScrollTop: 0,
    centers: [],
    active: false,
  }
}

const onPointerMove = (event: PointerEvent): void => {
  const session = drag
  if (session?.pointerId !== event.pointerId) return
  session.clientY = event.clientY
  if (session.active) {
    event.preventDefault()
    queueFrame()
  } else {
    const threshold = event.pointerType === 'touch' ? TOUCH_DRAG_THRESHOLD : DRAG_THRESHOLD
    if (Math.abs(event.clientY - session.startY) < threshold) return
    activateDrag(session)
    if (session.active) {
      event.preventDefault()
      queueFrame()
    }
  }
}

const onPointerUp = (event: PointerEvent): void => {
  if (drag?.pointerId !== event.pointerId) return
  if (!drag.active) {
    const index = drag.sourceIndex
    resetDrag()
    selectOrPlaceRow(index)
    return
  }

  drag.clientY = event.clientY
  const viewport = scrollAreaReference.value?.viewport
  const gap = viewport
    ? resolveGap(drag, viewport, viewport.getBoundingClientRect(), getVisibleTop(viewport))
    : dropGapIndex.value
  const target = gap === null ? null : getTableReorderTargetIndex(rows.length, drag.sourceIndex, gap)
  const source = drag.sourceIndex
  resetDrag()
  if (target !== null) emitReorder(source, target)
}

const onPointerCancel = (event: PointerEvent): void => {
  if (drag?.pointerId === event.pointerId) resetDrag()
}

watch(
  () => [
    rows,
    rows.length,
    columns,
    columns.length,
    rowKey,
    reorderable,
    loading,
    mode,
    compact,
    layout,
    stickyHeader,
    pagination,
    currentPage.value,
    normalizedPageSize.value,
  ],
  () => {
    resetDrag()
    selectedRowIndex.value = null
  },
  { flush: 'sync' }
)
onBeforeUnmount(resetDrag)
</script>

<style scoped>
div.table {
  --table-max-block-size: none;
  --table-bg: var(--surface-table);
  --table-header-bg: var(--table-bg);

  --table-cell-padding-block: var(--space-md);
  --table-cell-padding-inline: var(--space-lg);

  --table-border-width: 0px;
  --table-border-color: var(--divider-color);
  --table-border-radius: var(--radius-lg);

  --table-divider-width: var(--border-width-thin);

  --table-reorder-accent: var(--tone-primary);

  min-inline-size: 0;
  position: relative;
  container-type: inline-size;

  .table-footer {
    gap: var(--space-md);
    padding-block: var(--space-sm);
    padding-inline: var(--space-md);

    .page-summary {
      color: var(--text-color-dimmed);
      font-size: var(--font-size-sm);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .page-size-select {
      inline-size: 9rem;
    }
  }

  .table-content[data-reorder-clip] {
    overflow-y: clip;
  }

  & > .scroll {
    max-block-size: var(--table-max-block-size);
    box-shadow: var(--shadow-xs);

    border: var(--table-border-width) solid var(--table-border-color);
    border-radius: var(--table-border-radius);
    background: var(--table-bg);

    & table.content {
      border-spacing: 0;
      color: inherit;
      text-align: start;
      background: transparent;

      & > caption {
        padding-block: var(--table-cell-padding-block);
        padding-inline: var(--table-cell-padding-inline);
        text-align: start;
        font-size: var(--font-size-lg);
      }
    }
  }

  .header-cell,
  .cell {
    padding-block: var(--table-cell-padding-block);
    padding-inline: var(--table-cell-padding-inline);
    vertical-align: middle;

    &[data-align] {
      text-align: start;
    }

    &[data-align='center'] {
      text-align: center;
    }

    &[data-align='end'] {
      text-align: end;
    }

    &[data-type='number'] {
      font-variant-numeric: tabular-nums;
      text-align: end;
    }

    &[data-type='actions'] {
      inline-size: 1%;
      white-space: nowrap;
    }
  }

  .cell {
    &[data-wrap='false'] {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &[data-wrap='true'] {
      overflow-wrap: anywhere;
    }
  }

  .header-cell {
    background: var(--table-header-bg);
    font-weight: var(--font-weight-bold);
    border-block-end: var(--table-divider-width) solid var(--divider-color);

    &[data-align='center'] .sort-button {
      justify-content: center;
    }

    &[data-align='end'] .sort-button {
      justify-content: flex-end;
    }
  }

  .reorder-cell {
    inline-size: 1%;
    padding-inline: var(--space-sm);
    text-align: center;
    white-space: nowrap;
  }

  .reorder-handle {
    display: inline-grid;
    place-items: center;
    inline-size: 2.25rem;
    block-size: 2.25rem;
    border-radius: var(--radius-sm);
    color: var(--text-color-dimmed);
    cursor: grab;
    touch-action: none;
    user-select: none;

    transition-property: background-color, color;
    transition-duration: var(--duration-sm);
    transition-timing-function: var(--bezier-smooth);

    &:disabled {
      cursor: default;
      opacity: 0.45;
    }

    @media (hover: hover) {
      &:not(:disabled):hover {
        background: color-mix(in oklab, var(--text-color) 6%, transparent);
        color: inherit;
      }
    }
  }

  .visually-hidden {
    margin: -1px;
    clip: rect(0 0 0 0);
    border: 0;
  }

  &[data-dragging] {
    cursor: grabbing;
    user-select: none;

    .reorder-handle {
      cursor: grabbing;
    }
  }

  :is(.row, .details-row)[data-shift='up'] {
    --table-row-shift: calc(-1 * var(--table-drag-item-size));
  }

  :is(.row, .details-row)[data-shift='down'] {
    --table-row-shift: var(--table-drag-item-size);
  }

  &[data-dragging] :is(.row, .details-row):not([data-dragging]) > :is(.cell, .details-cell) {
    position: relative;
    transition: transform var(--duration-md) var(--bezier-smooth-entrance);
  }

  :is(.row, .details-row)[data-shift] > :is(.cell, .details-cell) {
    transform: translateY(var(--table-row-shift));
  }

  :is(.row, .details-row)[data-dragging] > :is(.cell, .details-cell) {
    position: relative;
    z-index: 2;
    background: var(--table-bg);
    opacity: 0.94;
    transform: translateY(var(--translate-y, 0px));
  }

  .row[data-dragging] > .cell {
    box-shadow: var(--shadow-xs);
  }

  .row[data-picked] > .cell {
    background: color-mix(in oklab, var(--table-reorder-accent) 9%, var(--table-bg));
  }

  .row[data-placed] > .cell {
    animation: table-row-placed var(--duration-xxl) var(--bezier-smooth-entrance);
  }

  .row[data-drop-before] > .cell {
    box-shadow: inset 0 2px var(--table-reorder-accent);
  }

  .row[data-drop-after] > .cell,
  .details-row[data-drop-after] > .details-cell {
    box-shadow: inset 0 -2px var(--table-reorder-accent);
  }

  .reorder-handle:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-dragging] :is(.row, .details-row):not([data-dragging]) > :is(.cell, .details-cell) {
      transition: none;
    }

    .row[data-placed] > .cell {
      animation: none;
    }
  }

  tbody > tr > :is(.cell, .details-cell) {
    border-block-start: var(--table-divider-width) solid var(--divider-color);
  }

  tbody > tr:first-child > .cell {
    border-block-start-color: transparent;
  }

  .sort-button {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--space-sm);
    inline-size: 100%;
    color: inherit;
    font: inherit;
    text-align: inherit;
    background: transparent;
    cursor: pointer;

    & > .sort-indicator {
      flex: none;
      opacity: 0;
      transform: scaleY(1);
      transition-property: opacity, transform;
      transition-duration: var(--duration-md);
      transition-timing-function: var(--bezier-smooth);
    }

    &:focus-visible > .sort-indicator {
      opacity: 0.65;
    }

    &[data-direction] > .sort-indicator {
      opacity: 1;
    }

    @media (hover: hover) {
      &:hover > .sort-indicator {
        opacity: 0.65;
      }
    }

    &[data-direction='desc'] > .sort-indicator {
      transform: scaleY(-1);
    }
  }

  .state {
    padding: var(--table-cell-padding-inline);
    text-align: center;

    & > .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--space-lg);
    }

    &:is(.loading, .empty) {
      color: var(--text-color-dimmed);
      font-size: var(--font-size-sm);
    }
  }

  .details-row {
    display: none;

    & > .details-cell {
      padding-block: var(--table-cell-padding-block);
      padding-inline: var(--table-cell-padding-inline);

      & > .details-list {
        display: grid;
        gap: var(--space-sm);

        & > .details-item {
          display: grid;
          grid-template-columns: minmax(6rem, 0.5fr) minmax(0, 1fr);
          gap: var(--space-sm);

          & > dt {
            font-weight: var(--font-weight-bold);
          }

          & > dd {
            min-inline-size: 0;
            margin: 0;
            overflow-wrap: anywhere;
          }
        }
      }
    }
  }

  &[data-layout='auto'] > .scroll table.content {
    inline-size: 100%;
    table-layout: auto;
  }

  &[data-layout='fixed'] > .scroll table.content {
    inline-size: 100%;
    table-layout: fixed;
  }

  &[data-layout='content'] > .scroll table.content {
    inline-size: max-content;
    min-inline-size: 100%;
  }

  &[data-sticky-header] > .scroll {
    .header-cell {
      position: sticky;
      inset-block-start: 0;
      z-index: 1;
    }
  }

  &[data-mode='details'][data-compact='true'] {
    .row[data-drop-after] > .cell {
      box-shadow: none;

      &::before {
        display: none;
      }
    }

    :is(.header-cell, .cell)[data-compact='details'],
    :is(.header-cell, .cell)[data-compact='hide'] {
      display: none;
    }

    .details-row {
      display: table-row;
    }
  }

  @container (inline-size < container-token(--container-md)) {
    &[data-mode='details'][data-compact='auto'] {
      .row[data-drop-after] > .cell {
        box-shadow: none;

        &::before {
          display: none;
        }
      }

      :is(.header-cell, .cell)[data-compact='details'],
      :is(.header-cell, .cell)[data-compact='hide'] {
        display: none;
      }

      .details-row {
        display: table-row;
      }
    }
  }
}
@keyframes table-row-placed {
  0% {
    background: color-mix(in oklab, var(--table-reorder-accent) 15%, var(--table-bg));
  }

  100% {
    background: var(--table-bg);
  }
}
</style>
