import { describe, expect, it } from 'vitest'

import { formatDeviceDateTime } from '../formatDeviceDateTime'

describe('formatDeviceDateTime', () => {
  it('serializes local date and time with padded fields', () => {
    expect(formatDeviceDateTime(new Date(2026, 9, 19, 4, 5, 6))).toBe('10/19/2026 04:05:06')
  })

  it('rejects invalid timestamps', () => {
    expect(() => formatDeviceDateTime(NaN)).toThrow(RangeError)
  })
})
