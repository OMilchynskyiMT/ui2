import { expect, it } from 'vitest'

import {
  getDisplayedTableRows,
  getTableCellText,
  getTablePage,
  getTablePageCount,
  getTablePageRows,
  getTablePageSize,
  getTableReorderGapIndex,
  getTableReorderShift,
  getTableReorderTargetIndex,
  getTableReorderVisibleGapIndex,
  getTableSortLabel,
  reorderTableRows,
} from '../table.shared'
import type { TableColumn } from '../table.types'

type Row = {
  name: string
  count: number
}

const columns: readonly TableColumn<Row>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'count', label: 'Count', sortable: true, type: 'number' },
]

const rows: readonly Row[] = [
  { name: 'Item 10', count: 10 },
  { name: 'Item 2', count: 2 },
  { name: 'Item 1', count: 1 },
]

it('sorts automatically while preserving source indexes', () => {
  const displayed = getDisplayedTableRows(rows, columns, { column: 'name', direction: 'asc' }, 'client')

  expect(displayed.map(entry => entry.row.name)).toEqual(['Item 1', 'Item 2', 'Item 10'])
  expect(displayed.map(entry => entry.sourceIndex)).toEqual([2, 1, 0])
})

it('does not sort rows in manual mode', () => {
  const displayed = getDisplayedTableRows(rows, columns, { column: 'count', direction: 'desc' }, 'manual')
  expect(displayed.map(entry => entry.row)).toEqual(rows)
})

it('formats cell text and sort labels', () => {
  expect(getTableCellText(rows[0]!, 0, columns[0]!)).toBe('Item 10')
  expect(getTableSortLabel(columns[0]!, { column: 'name', direction: 'asc' })).toContain('sorted ascending')
})

it('reorders rows without mutating the source array', () => {
  const reordered = reorderTableRows(rows, 0, 2)

  expect(reordered.map(row => row.name)).toEqual(['Item 2', 'Item 1', 'Item 10'])
  expect(rows.map(row => row.name)).toEqual(['Item 10', 'Item 2', 'Item 1'])
})

it('maps drop gaps to final row indexes', () => {
  expect(getTableReorderTargetIndex(3, 0, 0)).toBe(0)
  expect(getTableReorderTargetIndex(3, 0, 1)).toBe(0)
  expect(getTableReorderTargetIndex(3, 0, 2)).toBe(1)
  expect(getTableReorderTargetIndex(3, 0, 3)).toBe(2)
  expect(getTableReorderTargetIndex(3, 2, 0)).toBe(0)
  expect(getTableReorderTargetIndex(3, 2, 1)).toBe(1)
  expect(getTableReorderTargetIndex(3, 2, 3)).toBe(2)
  expect(getTableReorderTargetIndex(3, 3, 3)).toBeNull()
})

it('calculates drop gaps from immutable midpoints rather than transformed rows', () => {
  const centers = [20, 70, 150, 230]
  expect(getTableReorderGapIndex(centers, -10)).toBe(0)
  expect(getTableReorderGapIndex(centers, 70)).toBe(2)
  expect(getTableReorderGapIndex(centers, 210)).toBe(3)
  expect(getTableReorderGapIndex(centers, 300)).toBe(4)
})

it('displaces only rows crossed by the dragged row', () => {
  expect([0, 1, 2, 3].map(index => getTableReorderShift(0, 2, index))).toEqual([undefined, 'up', 'up', undefined])
  expect([0, 1, 2, 3].map(index => getTableReorderShift(3, 1, index))).toEqual([undefined, 'down', 'down', undefined])
  expect([0, 1, 2, 3].map(index => getTableReorderShift(2, 2, index))).toEqual([
    undefined,
    undefined,
    undefined,
    undefined,
  ])
})

it('keeps a valid vertical drop gap outside all viewport edges', () => {
  const centers = [30, 90, 150, 210]
  // viewport begins at 100, scrolls 40 px, and has a sticky header to 130
  expect(getTableReorderVisibleGapIndex(centers, -500, 130, 300, 100, 40)).toBe(1)
  expect(getTableReorderVisibleGapIndex(centers, 500, 130, 300, 100, 40)).toBe(4)
  expect(getTableReorderVisibleGapIndex(centers, 160, 130, 300, 100, 40)).toBe(2)
  // different scrollTop selects a different destination even if the pointer is "stationary"
  expect(getTableReorderVisibleGapIndex(centers, 160, 130, 300, 100, 100)).toBe(3)
})

it('previews the final positions of not dragged rows with unequal heights', () => {
  const heights = [32, 57, 41, 96, 23]
  const startOffsets = heights.map((_, index) => heights.slice(0, index).reduce((sum, height) => sum + height, 0))

  // eslint-disable-next-line unicorn/prefer-iterator-to-array
  const heightKeys = [...heights.keys()]
  for (const fromIndex of heightKeys) {
    for (const toIndex of heightKeys) {
      const original = heights.map((height, index) => ({ height, index }))
      const reordered = reorderTableRows(original, fromIndex, toIndex)
      const finalOffsets = reordered.map((_, index) =>
        reordered.slice(0, index).reduce((sum, row) => sum + row.height, 0)
      )

      const filteredHeightKeys = heightKeys.filter(k => k !== fromIndex)
      for (const index of filteredHeightKeys) {
        const shift = getTableReorderShift(fromIndex, toIndex, index)
        const previewOffset =
          startOffsets[index]! + (shift === 'up' ? -heights[fromIndex]! : shift === 'down' ? heights[fromIndex]! : 0)
        const destinationIndex = reordered.findIndex(row => row.index === index)
        expect(previewOffset).toBe(finalOffsets[destinationIndex])
      }
    }
  }
})

it('paginates after sorting without changing the original source indexes', () => {
  const sorted = getDisplayedTableRows(rows, columns, { column: 'name', direction: 'asc' }, 'client')

  expect(getTablePageRows(sorted, 1, 2).map(entry => entry.row.name)).toEqual(['Item 1', 'Item 2'])
  expect(getTablePageRows(sorted, 2, 2).map(entry => entry.sourceIndex)).toEqual([0])
  expect(rows.map(row => row.name)).toEqual(['Item 10', 'Item 2', 'Item 1'])
})

it('clamps pages when rows are removed and handles empty and invalid states', () => {
  expect(getTablePageCount(0, 10)).toBe(1)
  expect(getTablePageCount(51, 10)).toBe(6)
  expect(getTablePage(6, getTablePageCount(12, 10))).toBe(2)
  expect(getTablePage(-5, 10)).toBe(1)
  expect(getTablePage(NaN, 10)).toBe(1)
  expect(
    getTablePageRows(getDisplayedTableRows(rows, columns, null, 'client'), 99, 2).map(entry => entry.sourceIndex)
  ).toEqual([2])
  expect(getTablePageRows([], 1, 10)).toEqual([])
  expect(getTablePageSize(0)).toBe(10)
  expect(getTablePageSize(Infinity)).toBe(10)
  expect(getTablePageSize(2.9)).toBe(2)
})

it('maps visible-page drag gaps to original indexes without crossing pages', () => {
  const sixRows = [...rows, ...rows]
  const entries = getDisplayedTableRows(sixRows, columns, null, 'client')
  const secondPage = getTablePageRows(entries, 2, 2)
  const pageStart = 2

  expect(secondPage.map(entry => entry.sourceIndex)).toEqual([2, 3])
  expect(getTableReorderTargetIndex(sixRows.length, 2, pageStart)).toBe(2)
  expect(getTableReorderTargetIndex(sixRows.length, 2, pageStart + 2)).toBe(3)
  expect(reorderTableRows(sixRows, 2, 3).map(row => row.count)).toEqual([10, 2, 10, 1, 2, 1])
})
