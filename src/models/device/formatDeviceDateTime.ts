import { type DateValue, pad, toValidDate } from '@/lib/format/date'

// WARN: legacy device API uses local MM/DD/YYYY HH:mm:ss instead of ISO 8601
export const formatDeviceDateTime = (value: DateValue): string => {
  const date = toValidDate(value)
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
