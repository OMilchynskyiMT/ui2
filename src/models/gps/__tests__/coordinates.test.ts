import { describe, expect, it } from 'vitest'

import { formatGpsCoordinate, isValidGpsPosition, projectGpsPosition } from '../coordinates'

describe('GPS coordinates', () => {
  it('accepts the prime meridian/equator and limits', () => {
    expect(isValidGpsPosition({ lat: 0, lng: 0 })).toBe(true)
    expect(isValidGpsPosition({ lat: 90, lng: -180 })).toBe(true)
    expect(isValidGpsPosition({ lat: -90, lng: 180 })).toBe(true)
  })

  it('rejects missing, non-finite and out-of-range coordinates', () => {
    expect(isValidGpsPosition(null)).toBe(false)
    expect(isValidGpsPosition(undefined)).toBe(false)
    expect(isValidGpsPosition({ lat: NaN, lng: 20 })).toBe(false)
    expect(isValidGpsPosition({ lat: 91, lng: 20 })).toBe(false)
    expect(isValidGpsPosition({ lat: 20, lng: -181 })).toBe(false)
    expect(isValidGpsPosition({ lat: 20, lng: Infinity })).toBe(false)
  })

  it('uses a linear world projection with correct poles and dateline', () => {
    expect(projectGpsPosition({ lat: 0, lng: 0 })).toEqual({ x: 480, y: 240 })
    expect(projectGpsPosition({ lat: 90, lng: -180 })).toEqual({ x: 0, y: 0 })
    expect(projectGpsPosition({ lat: -90, lng: 180 })).toEqual({ x: 960, y: 480 })
    expect(projectGpsPosition({ lat: 45, lng: 90 })).toEqual({ x: 720, y: 120 })
  })

  it('formats degrees/minutes with direction and carries after rounding', () => {
    expect(formatGpsCoordinate(0, 'latitude')).toBe('0° 0.0000′ N')
    expect(formatGpsCoordinate(-73.5, 'longitude')).toBe('73° 30.0000′ W')
    expect(formatGpsCoordinate(12.99999999, 'latitude')).toBe('13° 0.0000′ N')
    expect(formatGpsCoordinate(-90, 'latitude')).toBe('90° 0.0000′ S')
    expect(() => formatGpsCoordinate(91, 'latitude')).toThrow(RangeError)
  })
})
