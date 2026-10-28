import { describe, expect, it } from 'vitest'

import { formatDeviceDateTime } from '../formatDeviceDateTime'
import { parseDeviceDateTime } from '../parseDeviceDateTime'

describe('parseDeviceDateTime', () => {
  it('parses the API format as browser-local time', () => {
    const date = parseDeviceDateTime('07/22/2026 16:27:38')

    expect(date).toBeInstanceOf(Date)
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(6)
    expect(date.getDate()).toBe(22)
    expect(date.getHours()).toBe(16)
    expect(date.getMinutes()).toBe(27)
    expect(date.getSeconds()).toBe(38)
    expect(date.getMilliseconds()).toBe(0)
  })

  it('round-trips through the existing device formatter', () => {
    const value = '02/29/2024 00:05:09'
    expect(formatDeviceDateTime(parseDeviceDateTime(value))).toBe(value)
    expect(parseDeviceDateTime('01/01/0099 01:02:03').getFullYear()).toBe(99)
  })

  it('rejects invalid calendar dates and time components', () => {
    for (const value of [
      '02/29/2025 00:00:00',
      '04/31/2026 12:00:00',
      '13/01/2026 12:00:00',
      '00/01/2026 12:00:00',
      '07/22/2026 24:00:00',
      '07/22/2026 16:60:00',
      '07/22/2026 16:27:60',
    ]) {
      expect(() => parseDeviceDateTime(value)).toThrow(RangeError)
    }
  })

  it('rejects non-API formats', () => {
    for (const value of ['07/22/2026', '2026-07-22T16:27:38', '7/22/2026 16:27:38', '07/22/2026 16:27']) {
      expect(() => parseDeviceDateTime(value)).toThrow(RangeError)
    }
  })
})
