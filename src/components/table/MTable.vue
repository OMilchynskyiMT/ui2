<template>
  <div
    :data-compact="compact"
    :data-layout="layout"
    :data-mode="mode"
    :data-sticky-header="stickyHeader || undefined"
    class="table"
  >
    <div class="viewport">
      <table :aria-busy="loading || undefined" :aria-label="ariaLabel" class="content">
        <caption v-if="caption || slots.caption">
          <slot name="caption">{{ caption }}</slot>
        </caption>

        <thead v-if="columns.length > 0">
          <tr>
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
              <slot :column="column" :name="getHeaderSlotName(column)" :sort="sort">
                <button
                  v-if="column.sortable"
                  :aria-label="getSortLabel(column)"
                  :data-direction="getSortDirection(column)"
                  class="sort-button"
                  type="button"
                  @click="toggleSort(column)"
                >
                  <span>{{ column.label }}</span>
                  <MIcon :icon="ChevronUpIcon" aria-hidden="true" class="sort-indicator" />
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
                  <MSpinner :stroke-width="4" indeterminate size="1.5rem" />
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
          <template v-for="(row, rowIndex) in rows" :key="getRowKey(row, rowIndex)">
            <tr class="row">
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
                  :row="row"
                  :row-index="rowIndex"
                  :value="getCellValue(row, rowIndex, column)"
                >
                  {{ getCellText(row, rowIndex, column) }}
                </slot>
              </component>
            </tr>

            <tr v-if="mode === 'details' && detailColumns.length > 0" class="details-row">
              <td :colspan="columnSpan" class="details-cell">
                <slot :columns="detailColumns" :row="row" :row-index="rowIndex" name="details">
                  <dl class="details-list">
                    <div v-for="column in detailColumns" :key="column.key" class="details-item">
                      <dt>{{ column.label }}</dt>
                      <dd>
                        <slot
                          :column="column"
                          :name="getDetailSlotName(column)"
                          :row="row"
                          :row-index="rowIndex"
                          :value="getCellValue(row, rowIndex, column)"
                        >
                          {{ getCellText(row, rowIndex, column) }}
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
  </div>
</template>

<script generic="Row" lang="ts" setup>
import { computed, type CSSProperties } from 'vue'
import { ChevronUpIcon } from '@lucide/vue'

import MIcon from '../MIcon.vue'
import MSpinner from '../progress/MSpinner.vue'

import type { SortDirection, TableColumn, TableProperties, TableSlots, TableSort } from './mtable.types'

const {
  columns,
  rows,
  rowKey,
  ariaLabel,
  caption,
  emptyLabel = 'No entries found',
  loading = false,
  loadingLabel,
  compact = 'auto',
  layout = 'auto',
  mode = 'scroll',
  sort,
  stickyHeader = false,
} = defineProps<TableProperties<Row>>()

const emit = defineEmits<{
  'update:sort': [sort: TableSort]
}>()

const slots = defineSlots<TableSlots<Row>>()

const columnSpan = computed(() => Math.max(columns.length, 1))
const detailColumns = computed(() => columns.filter(column => column.compact === 'details'))

const getColumnStyle = (column: TableColumn<Row>): CSSProperties => {
  return {
    width: column.width,
    minWidth: column.minWidth,
    maxWidth: column.maxWidth,
  }
}

const getRowKey = (row: Row, rowIndex: number): PropertyKey => {
  if (typeof rowKey === 'function') {
    return rowKey(row, rowIndex)
  }

  if (rowKey !== undefined && row !== null && typeof row === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return row[rowKey] as PropertyKey
  }

  return rowIndex
}

const getCellValue = (row: Row, rowIndex: number, column: TableColumn<Row>): unknown => {
  if (typeof column.value === 'function') {
    return column.value(row, rowIndex)
  }

  if (row === null || typeof row !== 'object') {
    return undefined
  }

  const key = column.value ?? column.key
  return row[key as keyof Row]
}

const getCellText = (row: Row, rowIndex: number, column: TableColumn<Row>): string | number => {
  const value = getCellValue(row, rowIndex, column)

  if (column.format) {
    return column.format(value, row, rowIndex)
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return value === null || value === undefined ? '' : String(value)
}

const getHeaderSlotName = (column: TableColumn<Row>): `header-${string}` => {
  return `header-${column.key}`
}

const getCellSlotName = (column: TableColumn<Row>): `cell-${string}` => {
  return `cell-${column.key}`
}

const getDetailSlotName = (column: TableColumn<Row>): `detail-${string}` => {
  return `detail-${column.key}`
}

const getSortDirection = (column: TableColumn<Row>): SortDirection | undefined => {
  return sort?.column === column.key ? sort.direction : undefined
}

const getAriaSort = (column: TableColumn<Row>): 'ascending' | 'descending' | undefined => {
  const direction = getSortDirection(column)
  if (direction === 'asc') return 'ascending'
  if (direction === 'desc') return 'descending'

  return undefined
}

const getSortLabel = (column: TableColumn<Row>): string => {
  const direction = getSortDirection(column)

  if (direction === 'asc') {
    return `${column.label}: sorted ascending. Sort descending`
  }

  if (direction === 'desc') {
    return `${column.label}: sorted descending. Sort ascending`
  }

  return `${column.label}: sort ascending`
}

const toggleSort = (column: TableColumn<Row>): void => {
  const direction = sort?.column === column.key && sort.direction === 'asc' ? 'desc' : 'asc'

  emit('update:sort', {
    column: column.key,
    direction,
  })
}
</script>

<style scoped>
div.table {
  --max-block-size: none;
  --bg: var(--surface-bg);
  --header-bg: var(--bg);

  --cell-padding-block: var(--space-md);
  --cell-padding-inline: var(--space-lg);

  --border-width: 0px;
  --border-color: color-mix(in srgb, currentcolor 8%, transparent);
  --border-radius: var(--radius-md);

  --divider-width: 1px;
  --divider-color: var(--border-color);

  min-inline-size: 0;
  container-type: inline-size;

  & > div.viewport {
    max-block-size: var(--max-block-size);
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    box-shadow: var(--shadow-xs);

    border: var(--border-width) solid var(--border-color);
    border-radius: var(--border-radius);
    background: var(--bg);

    & > table.content {
      border-spacing: 0;
      color: inherit;
      text-align: start;
      background: transparent;

      & > caption {
        padding-block: var(--cell-padding-block);
        padding-inline: var(--cell-padding-inline);
        text-align: start;
        color: light-dark(var(--cyan-800), var(--cyan-300));
        font-size: var(--font-size-lg);
      }
    }
  }

  .header-cell,
  .cell {
    padding-block: var(--cell-padding-block);
    padding-inline: var(--cell-padding-inline);
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
    background: var(--header-bg);
    font-weight: var(--font-weight-bold);
    border-block-end: var(--divider-width) solid var(--divider-color);

    &[data-align='center'] .sort-button {
      justify-content: center;
    }

    &[data-align='end'] .sort-button {
      justify-content: flex-end;
    }
  }

  tbody > tr:not(:first-child) > :is(.cell, .details-cell) {
    border-block-start: var(--divider-width) solid var(--divider-color);
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
      --color: var(--sort-indicator-color, var(--orange-500));
      --size: 1rem;

      flex: none;
      opacity: 0;
      transform: scaleY(1);
      transition-property: opacity, transform;
      transition-duration: var(--duration-md);
      transition-timing-function: var(--bezier-smooth);
    }

    &:is(:hover, :focus-visible, [data-direction]) > .sort-indicator {
      opacity: 0.65;
    }

    &[data-direction='asc'] > .sort-indicator {
      transform: scaleY(-1);
    }
  }

  .state {
    padding: var(--cell-padding-inline);
    text-align: center;

    & > .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }

    &:is(.loading, .empty) {
      color: oklch(from currentColor l c h / 0.5);
      font-size: var(--font-size-sm);
    }
  }

  .details-row {
    display: none;

    & > .details-cell {
      padding-block: var(--cell-padding-block);
      padding-inline: var(--cell-padding-inline);

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

  &[data-layout='auto'] > div.viewport > table.content {
    inline-size: 100%;
    table-layout: auto;
  }

  &[data-layout='fixed'] > div.viewport > table.content {
    inline-size: 100%;
    table-layout: fixed;
  }

  &[data-layout='content'] > div.viewport > table.content {
    inline-size: max-content;
    min-inline-size: 100%;
  }

  &[data-sticky-header] > div.viewport {
    overflow-y: auto;

    .header-cell {
      position: sticky;
      inset-block-start: 0;
      z-index: 1;
    }
  }

  &[data-mode='details'][data-compact='true'] {
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
</style>
