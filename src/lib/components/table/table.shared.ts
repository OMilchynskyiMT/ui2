import type { CSSProperties } from 'vue'

import type { SortDirection, TableColumn, TableProperties, TableSort } from './table.types'

export type DisplayedTableRow<Row> = {
  row: Row
  sourceIndex: number
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

export const getTableReorderTargetIndex = (rowCount: number, sourceIndex: number, gapIndex: number): number | null => {
  if (rowCount <= 0 || sourceIndex < 0 || sourceIndex >= rowCount || gapIndex < 0 || gapIndex > rowCount) {
    return null
  }

  return Math.min(rowCount - 1, gapIndex > sourceIndex ? gapIndex - 1 : gapIndex)
}

// resolve a drop position against stable, untransformed row midpoints
export const getTableReorderGapIndex = (rowCenters: readonly number[], pointerY: number): number => {
  const index = rowCenters.findIndex(center => pointerY < center)
  return index === -1 ? rowCenters.length : index
}

// clamp vertical pointer position to the scroll viewport
export const getTableReorderVisibleGapIndex = (
  rowCenters: readonly number[],
  clientY: number,
  top: number,
  bottom: number,
  viewportTop: number,
  scrollTop: number
): number => {
  const visibleY = Math.max(top, Math.min(clientY, bottom))
  return getTableReorderGapIndex(rowCenters, visibleY - viewportTop + scrollTop)
}

// other rows slde into the vacated slot while the dragged row floats above them
export const getTableReorderShift = (
  sourceIndex: number,
  targetIndex: number,
  rowIndex: number
): 'up' | 'down' | undefined => {
  if (targetIndex > sourceIndex && rowIndex > sourceIndex && rowIndex <= targetIndex) return 'up'
  if (targetIndex < sourceIndex && rowIndex >= targetIndex && rowIndex < sourceIndex) return 'down'
  return undefined
}

export const reorderTableRows = <Row>(rows: readonly Row[], fromIndex: number, toIndex: number): Row[] => {
  const reordered = [...rows]
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    fromIndex >= reordered.length ||
    toIndex < 0 ||
    toIndex >= reordered.length
  ) {
    return reordered
  }

  const [row] = reordered.splice(fromIndex, 1)
  if (row === undefined) return reordered

  reordered.splice(toIndex, 0, row)
  return reordered
}

export const getTableColumnStyle = <Row>(column: TableColumn<Row>): CSSProperties => ({
  width: column.width,
  minWidth: column.minWidth,
  maxWidth: column.maxWidth,
})

export const getTableRowKey = <Row>(
  row: Row,
  rowIndex: number,
  rowKey: TableProperties<Row>['rowKey']
): PropertyKey => {
  if (typeof rowKey === 'function') return rowKey(row, rowIndex)

  if (rowKey !== undefined && row !== null && typeof row === 'object') {
    return row[rowKey] as PropertyKey
  }

  return rowIndex
}

export const getTableCellValue = <Row>(row: Row, rowIndex: number, column: TableColumn<Row>): unknown => {
  if (typeof column.value === 'function') return column.value(row, rowIndex)
  if (row === null || typeof row !== 'object') return undefined

  const key = column.value ?? column.key
  return row[key as keyof Row]
}

export const getTableCellText = <Row>(row: Row, rowIndex: number, column: TableColumn<Row>): string | number => {
  const value = getTableCellValue(row, rowIndex, column)
  if (column.format) return column.format(value, row, rowIndex)

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return value === null || value === undefined ? '' : String(value)
}

export const getTableHeaderSlotName = <Row>(column: TableColumn<Row>): `header-${string}` => `header-${column.key}`
export const getTableCellSlotName = <Row>(column: TableColumn<Row>): `cell-${string}` => `cell-${column.key}`
export const getTableDetailSlotName = <Row>(column: TableColumn<Row>): `detail-${string}` => `detail-${column.key}`

export const getTableSortDirection = <Row>(
  column: TableColumn<Row>,
  sort: TableSort | null | undefined
): SortDirection | undefined => {
  return sort?.column === column.key ? sort.direction : undefined
}

export const getTableAriaSort = <Row>(
  column: TableColumn<Row>,
  sort: TableSort | null | undefined
): 'ascending' | 'descending' | undefined => {
  const direction = getTableSortDirection(column, sort)
  if (direction === 'asc') return 'ascending'
  if (direction === 'desc') return 'descending'
  return undefined
}

export const getTableSortLabel = <Row>(column: TableColumn<Row>, sort: TableSort | null | undefined): string => {
  const direction = getTableSortDirection(column, sort)
  if (direction === 'asc') return `${column.label}: sorted ascending. Sort descending`
  if (direction === 'desc') return `${column.label}: sorted descending. Sort ascending`
  return `${column.label}: sort ascending`
}

const compareTableValues = <Row>(left: unknown, right: unknown, column: TableColumn<Row>): number => {
  if (column.type === 'number') {
    const leftNumber = typeof left === 'number' ? left : Number(left)
    const rightNumber = typeof right === 'number' ? right : Number(right)
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber
  } else if (column.type === 'date') {
    const leftTime = left instanceof Date ? left.getTime() : Date.parse(String(left))
    const rightTime = right instanceof Date ? right.getTime() : Date.parse(String(right))
    if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) return leftTime - rightTime
  }

  if (column.type === 'boolean' || (typeof left === 'boolean' && typeof right === 'boolean')) {
    return Number(Boolean(left)) - Number(Boolean(right))
  }

  if (typeof left === 'number' && typeof right === 'number') return left - right
  return collator.compare(String(left), String(right))
}

export const getDisplayedTableRows = <Row>(
  rows: readonly Row[],
  columns: readonly TableColumn<Row>[],
  sort: TableSort | null | undefined,
  sortMode: TableProperties<Row>['sortMode']
): DisplayedTableRow<Row>[] => {
  const sourceRows = rows.map((row, sourceIndex) => ({ row, sourceIndex }))
  if (sortMode === 'manual' || !sort) return sourceRows

  const column = columns.find(candidate => candidate.key === sort.column)
  if (!column?.sortable) return sourceRows

  const direction = sort.direction === 'asc' ? 1 : -1
  return sourceRows.toSorted((leftEntry, rightEntry) => {
    const left = getTableCellValue(leftEntry.row, leftEntry.sourceIndex, column)
    const right = getTableCellValue(rightEntry.row, rightEntry.sourceIndex, column)

    if (left == null && right == null) return leftEntry.sourceIndex - rightEntry.sourceIndex
    if (left == null) return 1
    if (right == null) return -1

    const comparison = column.compare
      ? column.compare(left, right, leftEntry.row, rightEntry.row)
      : compareTableValues(left, right, column)

    return comparison === 0 ? leftEntry.sourceIndex - rightEntry.sourceIndex : comparison * direction
  })
}
