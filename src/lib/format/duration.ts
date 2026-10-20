export type DurationFormatOptions = Readonly<{
  style?: 'compact' | 'long'
  maxUnits?: number
  locale?: Intl.LocalesArgument
}>

const UNITS = [
  { name: 'day', size: 86_400_000, symbol: 'd' },
  { name: 'hour', size: 3_600_000, symbol: 'h' },
  { name: 'minute', size: 60_000, symbol: 'm' },
  { name: 'second', size: 1000, symbol: 's' },
] as const

/**
 * Formats an elapsed duration in milliseconds. Days are fixed 24-hour periods,
 * sub-second precision is truncated, months and years are excluded
 *
 * @example formatDuration(93_600_000) // '1d 2h'
 */
export const formatDuration = (milliseconds: number, options: DurationFormatOptions = {}): string => {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new RangeError('Duration must be a finite non-negative number of milliseconds')
  }

  const { style = 'compact', maxUnits = 2, locale } = options
  if (!Number.isSafeInteger(maxUnits) || maxUnits < 1) {
    throw new RangeError('maxUnits must be a positive integer')
  }

  let remainder = Math.floor(milliseconds / 1000)
  const numberFormatter = new Intl.NumberFormat(locale, { useGrouping: false })
  const parts: string[] = []

  for (const unit of UNITS) {
    const quantity = Math.floor(remainder / (unit.size / 1000))
    remainder %= unit.size / 1000
    if (quantity === 0) continue

    parts.push(
      style === 'compact'
        ? `${numberFormatter.format(quantity)}${unit.symbol}`
        : new Intl.NumberFormat(locale, { style: 'unit', unit: unit.name, unitDisplay: 'long' }).format(quantity)
    )
    if (parts.length === maxUnits) break
  }

  if (parts.length === 0)
    return style === 'compact'
      ? '0s'
      : new Intl.NumberFormat(locale, { style: 'unit', unit: 'second', unitDisplay: 'long' }).format(0)
  return style === 'compact'
    ? parts.join(' ')
    : new Intl.ListFormat(locale, { style: 'long', type: 'unit' }).format(parts)
}
