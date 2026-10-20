import { describe, expect, it } from 'vitest'

import { formatLocalDateInput, toValidDate } from '../date'
import { formatDuration } from '../duration'
import { formatRelativeTime } from '../relativeTime'

const now = '2026-10-19T12:00:00Z'
const relative = (value: string, options: Parameters<typeof formatRelativeTime>[1] = {}) =>
  formatRelativeTime(value, { locale: 'en', now, ...options })

describe('formatRelativeTime', () => {
  it('handles present, past and future instants', () => {
    expect(relative(now)).toBe('now')
    expect(relative('2026-10-19T11:55:00Z')).toBe('5 minutes ago')
    expect(relative('2026-10-19T15:00:00Z')).toBe('in 3 hours')
  })

  it('uses locale-aware calendar-relative words', () => {
    expect(relative('2026-10-18T12:00:00Z')).toBe('yesterday')
    expect(relative('2026-10-20T12:00:00Z')).toBe('tomorrow')
    expect(relative('2026-10-19T11:59:00Z', { numeric: 'always' })).toBe('1 minute ago')
  })

  it('uses calendar months and years for longer spans', () => {
    expect(relative('2026-08-19T12:00:00Z')).toBe('2 months ago')
    expect(relative('2024-10-19T12:00:00Z')).toBe('2 years ago')
    expect(formatRelativeTime('2024-02-29T12:00:00Z', { now: '2024-03-29T12:00:00Z', locale: 'en' })).toBe('last month')
  })

  it('supports short formatting and rejects invalid timestamps', () => {
    expect(relative('2026-10-19T11:55:00Z', { style: 'short' })).toBe('5 min. ago')
    expect(() => relative('not a date')).toThrow(RangeError)
    expect(() => relative('2026-10-19T11:55:00Z', { now: NaN })).toThrow(RangeError)
  })
})

describe('formatDuration', () => {
  it('formats elapsed time using fixed units', () => {
    expect(formatDuration(0)).toBe('0s')
    expect(formatDuration(900)).toBe('0s')
    expect(formatDuration(42_000)).toBe('42s')
    expect(formatDuration(93_605_000)).toBe('1d 2h')
    expect(formatDuration(93_905_000, { maxUnits: 4 })).toBe('1d 2h 5m 5s')
    expect(formatDuration(40 * 86_400_000)).toBe('40d')
  })

  it('supports long labels and configurable precision', () => {
    expect(formatDuration(3_660_000, { style: 'long', locale: 'en' })).toBe('1 hour, 1 minute')
    expect(formatDuration(60_000, { maxUnits: 1 })).toBe('1m')
  })

  it('rejects negative and non-finite input or invalid maxUnits', () => {
    expect(() => formatDuration(-1)).toThrow(RangeError)
    expect(() => formatDuration(Infinity)).toThrow(RangeError)
    expect(() => formatDuration(1000, { maxUnits: 0 })).toThrow(RangeError)
  })
})

describe('local date formats', () => {
  it('formats browser dates in local time with padded fields', () => {
    const date = new Date(2026, 9, 19, 4, 5, 6)
    expect(formatLocalDateInput(date)).toBe('2026-10-19')
  })

  it('rejects invalid dates rather than silently substituting now', () => {
    expect(() => toValidDate(new Date(NaN))).toThrow(RangeError)
    expect(() => formatLocalDateInput('invalid')).toThrow(RangeError)
  })
})
