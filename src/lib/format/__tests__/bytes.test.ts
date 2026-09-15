import { describe, expect, it } from 'vitest'

import { formatBytes } from '../bytes'

describe('formatBytes', () => {
  it('formats binary byte quantities with IEC units by default', () => {
    expect(formatBytes(0, { locale: 'en' })).toBe('0 B')
    expect(formatBytes(1000, { locale: 'en' })).toBe('1000 B')
    expect(formatBytes(1024, { locale: 'en' })).toBe('1 KiB')
    expect(formatBytes(1536, { locale: 'en' })).toBe('1.5 KiB')
    expect(formatBytes(1024 ** 3, { locale: 'en' })).toBe('1 GiB')
  })

  it('supports decimal SI units for quantities that use base 1000', () => {
    expect(formatBytes(1000, { locale: 'en', unitSystem: 'decimal' })).toBe('1 kB')
    expect(formatBytes(1_500_000, { locale: 'en', unitSystem: 'decimal' })).toBe('1.5 MB')
  })

  it('supports explicit precision and signed values', () => {
    expect(formatBytes(-1536, { locale: 'en', maximumFractionDigits: 2 })).toBe('-1.5 KiB')
    expect(formatBytes(1280, { locale: 'en', minimumFractionDigits: 2 })).toBe('1.25 KiB')
  })

  it('rejects non-finite values', () => {
    expect(() => formatBytes(NaN)).toThrow(RangeError)
    expect(() => formatBytes(Infinity)).toThrow(RangeError)
  })
})
