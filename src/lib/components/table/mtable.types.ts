import type { VNode } from 'vue'

export type TableLayout = 'auto' | 'fixed' | 'content'
export type TableResponsiveMode = 'scroll' | 'details'
export type TableCompactMode = boolean | 'auto'
export type CellAlign = 'start' | 'center' | 'end'
export type SortDirection = 'asc' | 'desc'
export type TableColumnKey = string
export type TableColumnType = 'text' | 'number' | 'date' | 'boolean' | 'actions'

export type TableSort = {
  column: TableColumnKey
  direction: SortDirection
}

export type TableColumn<Row> = {
  key: TableColumnKey
  label: string
  value?: keyof Row | ((row: Row, rowIndex: number) => unknown)
  format?: (value: unknown, row: Row, rowIndex: number) => string | number

  type?: TableColumnType
  align?: CellAlign
  headerAlign?: CellAlign

  width?: string
  minWidth?: string
  maxWidth?: string

  wrap?: boolean
  compact?: 'keep' | 'details' | 'hide'

  rowHeader?: boolean
  sortable?: boolean
}

type TableProperties<Row> = {
  columns: TableColumn<Row>[]
  rows: Row[]
  rowKey?: keyof Row | ((row: Row, rowIndex: number) => PropertyKey)

  ariaLabel?: string
  caption?: string
  emptyLabel?: string
  loading?: boolean
  loadingLabel?: string

  compact?: TableCompactMode
  layout?: TableLayout
  mode?: TableResponsiveMode
  sort?: TableSort | null
  stickyHeader?: boolean
}

type HeaderSlotProperties<Row> = {
  column: TableColumn<Row>
  sort: TableSort | null | undefined
}

type CellSlotProperties<Row> = {
  column: TableColumn<Row>
  row: Row
  rowIndex: number
  value: unknown
}

type DetailsSlotProperties<Row> = {
  columns: TableColumn<Row>[]
  row: Row
  rowIndex: number
}

type TableSlots<Row> = {
  caption?: () => VNode[]
  empty?: () => VNode[]
  loading?: () => VNode[]
  details?: (properties: DetailsSlotProperties<Row>) => VNode[]
} & {
  [name: `header-${string}`]: ((properties: HeaderSlotProperties<Row>) => VNode[]) | undefined
  [name: `cell-${string}`]: ((properties: CellSlotProperties<Row>) => VNode[]) | undefined
  [name: `detail-${string}`]: ((properties: CellSlotProperties<Row>) => VNode[]) | undefined
}

export type { TableProperties, TableSlots }
