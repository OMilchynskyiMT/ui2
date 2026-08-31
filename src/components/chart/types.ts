export type ChartLabel = string | number
export type ChartValue = number | null

export type ChartSeries = Readonly<{
  id: string
  label: string
  values: readonly ChartValue[]
  color?: string
}>

type BaseChart<TType extends string> = Readonly<{
  type: TType
  labels: readonly ChartLabel[]
  series: readonly ChartSeries[]
}>

export type BarChart = BaseChart<'bar'> &
  Readonly<{
    stacked?: boolean
  }>

export type ChartDefinition = BarChart

export type ChartLabelFormatter = (value: ChartLabel) => string
export type ChartValueFormatter = (value: number) => string
