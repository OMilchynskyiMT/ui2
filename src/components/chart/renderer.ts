import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  type ChartData as ChartJsData,
  type ChartOptions as ChartJsOptions,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'

import { resolveColor } from './helpers'
import type { BarChart, ChartDefinition, ChartLabelFormatter, ChartValue, ChartValueFormatter } from './types'

type RendererOptions = Readonly<{
  formatLabel: ChartLabelFormatter
  formatValue: ChartValueFormatter
}>

type Renderer = Readonly<{
  update: (chart: ChartDefinition) => boolean
  destroy: () => void
}>

const validateBarChart = (chart: BarChart): void => {
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

  return {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: chart.series.length > 1,
      },
      tooltip: {
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
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
        },
      },
      y: {
        stacked: isStacked,
        beginAtZero: true,
        ticks: {
          callback: value => {
            return typeof value === 'number' ? options.formatValue(value) : value
          },
        },
      },
    },
  }
}

const createBarRenderer = (canvas: HTMLCanvasElement, chart: BarChart, options: RendererOptions): Renderer => {
  validateBarChart(chart)
  Chart.register(BarController, BarElement, CategoryScale, Legend, LinearScale, Tooltip)
  const instance = new Chart<'bar', ChartValue[], string>(canvas, {
    type: 'bar',
    data: createBarData(chart, options),
    options: createBarOptions(chart, options),
  })

  // eslint-disable-next-line unicorn/consistent-boolean-name
  const update = (nextChart: ChartDefinition): boolean => {
    if (nextChart.type !== 'bar') return false
    validateBarChart(nextChart)
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

const createRenderer = (canvas: HTMLCanvasElement, chart: ChartDefinition, options: RendererOptions): Renderer => {
  switch (chart.type) {
    case 'bar': {
      return createBarRenderer(canvas, chart, options)
    }

    // NOTE: future chart types: linear, pie, etc...

    default: {
      throw new Error(`Unsupported chart definition: ${JSON.stringify(chart.type)}`)
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
