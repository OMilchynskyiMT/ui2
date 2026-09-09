import { expect, it } from 'vitest'

import { getDisplayedTableRows, getTableCellText, getTableSortLabel } from '../mtable.shared'
import type { TableColumn } from '../mtable.types'

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
  const displayed = getDisplayedTableRows(rows, columns, { column: 'name', direction: 'asc' }, 'auto')

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
