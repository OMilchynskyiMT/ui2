import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  type ChartData as ChartJsData,
  type ChartOptions as ChartJsOptions,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'

import { resolveColor } from './helpers'
import type {
  BarChart,
  ChartDefinition,
  ChartLabelFormatter,
  ChartValue,
  ChartValueFormatter,
  LineChart,
} from './types'

type RendererOptions = Readonly<{
  formatLabel: ChartLabelFormatter
  formatValue: ChartValueFormatter
}>

type ChartTheme = Readonly<{
  text: string
  grid: string
  tooltipBackground: string
  tooltipText: string
}>

const resolveChartTheme = (): ChartTheme => ({
  text: resolveColor('--chart-text-color'),
  grid: resolveColor('--chart-grid-color'),
  tooltipBackground: resolveColor('--chart-tooltip-background'),
  tooltipText: resolveColor('--chart-tooltip-color'),
})

type Renderer = Readonly<{
  update: (chart: ChartDefinition) => boolean
  destroy: () => void
}>

const validateChart = (chart: ChartDefinition): void => {
  const seriesIds = new Set<string>()
  const labelsCount = chart.labels.length

  for (const label of chart.labels) {
    if (typeof label === 'number' && !Number.isFinite(label)) {
      throw new TypeError('Chart labels must contain only finite numbers')
    }
  }

  for (const series of chart.series) {
    if (seriesIds.has(series.id)) {
      throw new Error(`Duplicate chart series id: ${series.id}`)
    }

    seriesIds.add(series.id)
    if (series.values.length !== labelsCount) {
      throw new Error(`Chart series "${series.id}" contains ${series.values.length} values for ${labelsCount} labels`)
    }

    for (const value of series.values) {
      if (value !== null && !Number.isFinite(value)) {
        throw new Error(`Chart series "${series.id}" contains a non-finite value`)
      }
    }
  }
}

const createBarData = (chart: BarChart, options: RendererOptions): ChartJsData<'bar', ChartValue[], string> => {
  return {
    labels: chart.labels.map(element => options.formatLabel(element)),
    datasets: chart.series.map(series => ({
      label: series.label,
      data: [...series.values],
      backgroundColor: series.color ? resolveColor(series.color) : undefined,
    })),
  }
}

const createBarOptions = (chart: BarChart, options: RendererOptions): ChartJsOptions<'bar'> => {
  const isStacked = chart.stacked === true
  const theme = resolveChartTheme()

  return {
    color: theme.text,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: chart.series.length > 1,
        labels: {
          color: theme.text,
        },
      },
      tooltip: {
        backgroundColor: theme.tooltipBackground,
        titleColor: theme.tooltipText,
        bodyColor: theme.tooltipText,
        callbacks: {
          label: context => {
            const label = context.dataset.label
            const value = context.parsed.y === null ? String() : options.formatValue(context.parsed.y)

            return label ? `${label}: ${value}` : value
          },
        },
      },
    },

    scales: {
      x: {
        stacked: isStacked,
        border: {
          color: theme.grid,
        },
        grid: {
          display: false,
          color: theme.grid,
        },
        ticks: {
          color: theme.text,
          maxRotation: 0,
        },
      },
      y: {
        stacked: isStacked,
        beginAtZero: true,
        border: {
          color: theme.grid,
        },
        grid: {
          color: theme.grid,
        },
        ticks: {
          color: theme.text,
          callback: value => {
            return typeof value === 'number' ? options.formatValue(value) : value
          },
        },
      },
    },
  }
}

const createBarRenderer = (canvas: HTMLCanvasElement, chart: BarChart, options: RendererOptions): Renderer => {
  validateChart(chart)
  Chart.register(BarController, BarElement, CategoryScale, Legend, LinearScale, Tooltip)
  const instance = new Chart<'bar', ChartValue[], string>(canvas, {
    type: 'bar',
    data: createBarData(chart, options),
    options: createBarOptions(chart, options),
  })

  // eslint-disable-next-line unicorn/consistent-boolean-name
  const update = (nextChart: ChartDefinition): boolean => {
    if (nextChart.type !== 'bar') return false
    validateChart(nextChart)
    instance.data = createBarData(nextChart, options)
    instance.options = createBarOptions(nextChart, options)
    instance.update('none')
    return true
  }

  const destroy = (): void => {
    instance.destroy()
  }

  return {
    update,
    destroy,
  }
}

const createLineData = (chart: LineChart, options: RendererOptions): ChartJsData<'line', ChartValue[], string> => {
  return {
    labels: chart.labels.map(element => options.formatLabel(element)),
    datasets: chart.series.map(series => {
      const color = series.color ? resolveColor(series.color) : undefined

      return {
        label: series.label,
        data: [...series.values],
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        pointRadius: chart.points === true ? 2.5 : 0,
        pointHoverRadius: 4,
        pointHitRadius: 8,
        tension: 0.28,
      }
    }),
  }
}

const createLineOptions = (chart: LineChart, options: RendererOptions): ChartJsOptions<'line'> => {
  const theme = resolveChartTheme()

  return {
    color: theme.text,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: chart.series.length > 1,
        labels: {
          color: theme.text,
          usePointStyle: true,
          pointStyle: 'line',
        },
      },
      tooltip: {
        backgroundColor: theme.tooltipBackground,
        titleColor: theme.tooltipText,
        bodyColor: theme.tooltipText,
        callbacks: {
          label: context => {
            const label = context.dataset.label
            const value = context.parsed.y === null ? String() : options.formatValue(context.parsed.y)

            return label ? `${label}: ${value}` : value
          },
        },
      },
    },
    scales: {
      x: {
        border: {
          color: theme.grid,
        },
        grid: {
          display: false,
          color: theme.grid,
        },
        ticks: {
          color: theme.text,
          autoSkip: true,
          maxRotation: 0,
          maxTicksLimit: 7,
        },
      },
      y: {
        beginAtZero: true,
        border: {
          color: theme.grid,
        },
        grid: {
          color: theme.grid,
        },
        ticks: {
          color: theme.text,
          callback: value => {
            return typeof value === 'number' ? options.formatValue(value) : value
          },
        },
      },
    },
  }
}

const createLineRenderer = (canvas: HTMLCanvasElement, chart: LineChart, options: RendererOptions): Renderer => {
  validateChart(chart)
  Chart.register(CategoryScale, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip)
  const instance = new Chart<'line', ChartValue[], string>(canvas, {
    type: 'line',
    data: createLineData(chart, options),
    options: createLineOptions(chart, options),
  })

  // eslint-disable-next-line unicorn/consistent-boolean-name
  const update = (nextChart: ChartDefinition): boolean => {
    if (nextChart.type !== 'line') return false
    validateChart(nextChart)
    instance.data = createLineData(nextChart, options)
    instance.options = createLineOptions(nextChart, options)
    instance.update('none')
    return true
  }

  const destroy = (): void => {
    instance.destroy()
  }

  return {
    update,
    destroy,
  }
}

const createRenderer = (canvas: HTMLCanvasElement, chart: ChartDefinition, options: RendererOptions): Renderer => {
  switch (chart.type) {
    case 'bar': {
      return createBarRenderer(canvas, chart, options)
    }
    case 'line': {
      return createLineRenderer(canvas, chart, options)
    }
  }
}

export const createChartRenderer = (canvas: HTMLCanvasElement, chart: ChartDefinition, options: RendererOptions) => {
  let renderer = createRenderer(canvas, chart, options)
  const update = (nextChart: ChartDefinition): void => {
    if (renderer.update(nextChart)) return
    renderer.destroy()
    renderer = createRenderer(canvas, nextChart, options)
  }

  const destroy = (): void => {
    renderer.destroy()
  }

  return {
    update,
    destroy,
  }
}
