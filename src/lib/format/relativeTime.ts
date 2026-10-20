import { type DateValue, toValidDate } from './date'

export type RelativeTimeOptions = Readonly<{
  now?: DateValue
  locale?: Intl.LocalesArgument
  style?: Intl.RelativeTimeFormatStyle
  numeric?: Intl.RelativeTimeFormatNumeric
}>

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// completed calendar months between two instants, with end-of-month clamping
const completedMonths = (first: Date, second: Date): number => {
  const earlier = first <= second ? first : second
  const later = first <= second ? second : first
  let months = (later.getFullYear() - earlier.getFullYear()) * 12 + later.getMonth() - earlier.getMonth()

  const endOfMonth = new Date(earlier.getFullYear(), earlier.getMonth() + months + 1, 0).getDate()
  const anniversary = new Date(earlier)
  anniversary.setDate(1)
  anniversary.setMonth(earlier.getMonth() + months)
  anniversary.setDate(Math.min(earlier.getDate(), endOfMonth))
  if (anniversary > later) months--

  return Math.max(0, months)
}

/**
 * Formats a timestamp relative to another instant (now by default).
 *
 * Uses native locale-aware wording and human-readable unit thresholds. Months
 * and years use calendar boundaries, not fixed 30-/364-day approximations.
 * The result is descriptive, not a precise duration; use `formatDuration`
 * for elapsed-time quantities.
 *
 * @example formatRelativeTime('2026-10-18T12:00:00Z', { now: '2026-10-19T12:00:00Z', locale: 'en' }) // 'yesterday'
 */
export const formatRelativeTime = (value: DateValue, options: RelativeTimeOptions = {}): string => {
  const date = toValidDate(value)
  const now = toValidDate(options.now ?? Date.now())
  const difference = date.getTime() - now.getTime()
  const absolute = Math.abs(difference)
  const direction = difference < 0 ? -1 : 1
  const formatter = new Intl.RelativeTimeFormat(options.locale, {
    numeric: options.numeric ?? 'auto',
    style: options.style ?? 'long',
  })

  if (absolute < 45 * SECOND) return formatter.format(0, 'second')

  const render = (quantity: number, unit: Intl.RelativeTimeFormatUnit): string =>
    formatter.format(direction * quantity, unit)

  if (absolute < 90 * SECOND) return render(1, 'minute')
  if (absolute < 45 * MINUTE) return render(Math.round(absolute / MINUTE), 'minute')
  if (absolute < 90 * MINUTE) return render(1, 'hour')
  if (absolute < 22 * HOUR) return render(Math.round(absolute / HOUR), 'hour')
  if (absolute < 36 * HOUR) return render(1, 'day')
  if (absolute < 7 * DAY) return render(Math.round(absolute / DAY), 'day')
  if (absolute < 28 * DAY) return render(Math.round(absolute / (7 * DAY)), 'week')

  const months = completedMonths(date, now)
  if (months === 0) return render(Math.round(absolute / (7 * DAY)), 'week')
  if (months < 12) return render(months, 'month')
  return render(Math.round(months / 12), 'year')
}
