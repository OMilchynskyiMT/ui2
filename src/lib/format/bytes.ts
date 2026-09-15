export type ByteUnitSystem = 'binary' | 'decimal'

export type FormatBytesOptions = Readonly<{
  unitSystem?: ByteUnitSystem
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  locale?: Intl.LocalesArgument
}>

const BINARY_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'] as const
const DECIMAL_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'] as const

export const formatBytes = (bytes: number, options: FormatBytesOptions = {}): string => {
  if (!Number.isFinite(bytes)) {
    throw new RangeError('bytes must be a finite number')
  }

  const { unitSystem = 'binary', maximumFractionDigits = 1, minimumFractionDigits = 0, locale } = options
  const base = unitSystem === 'binary' ? 1024 : 1000
  const units = unitSystem === 'binary' ? BINARY_UNITS : DECIMAL_UNITS
  const absolute = Math.abs(bytes)
  const unitIndex = absolute === 0 ? 0 : Math.min(Math.floor(Math.log(absolute) / Math.log(base)), units.length - 1)
  const value = absolute === 0 ? 0 : bytes / base ** unitIndex
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: Math.max(maximumFractionDigits, minimumFractionDigits),
    minimumFractionDigits,
    useGrouping: false,
  }).format(value)

  return `${formatted} ${units[unitIndex]}`
}
