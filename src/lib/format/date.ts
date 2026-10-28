export type DateValue = Date | number | string

export const toValidDate = (value: DateValue): Date => {
  const timestamp = value instanceof Date ? value.getTime() : typeof value === 'string' ? Date.parse(value) : value
  const date = new Date(timestamp)
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid date')
  return date
}

export const pad = (value: number): string => String(value).padStart(2, '0')

// NOTE: local date for native `<input type="date">`, never UTC (which can shift the day)
export const formatLocalDateInput = (value: DateValue): string => {
  const date = toValidDate(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
