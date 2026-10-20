// geographic coordinates in decimal degrees (WGS84)
export type GpsPosition = Readonly<{
  lat: number
  lng: number
}>

export type GpsAxis = 'latitude' | 'longitude'

export const isValidGpsPosition = (position: GpsPosition | null | undefined): position is GpsPosition =>
  position !== null &&
  position !== undefined &&
  Number.isFinite(position.lat) &&
  Number.isFinite(position.lng) &&
  Math.abs(position.lat) <= 90 &&
  Math.abs(position.lng) <= 180

// Equirectangular (plate carrée) projection over the full world, without magical specific formulas
export const projectGpsPosition = (position: GpsPosition): Readonly<{ x: number; y: number }> => ({
  x: ((position.lng + 180) / 360) * 960,
  y: ((90 - position.lat) / 180) * 480,
})

// formats a coordinate as degrees and decimal minutes with a hemisphere
export const formatGpsCoordinate = (value: number, axis: GpsAxis): string => {
  const limit = axis === 'latitude' ? 90 : 180
  if (!Number.isFinite(value) || Math.abs(value) > limit) throw new RangeError(`Invalid ${axis}`)

  // round the total first to avoid displaying e.g. 12° 60.0000′
  const roundedMinutes = Math.round(Math.abs(value) * 60 * 10_000) / 10_000
  const degrees = Math.floor(roundedMinutes / 60)
  const minutes = roundedMinutes - degrees * 60
  const hemisphere = axis === 'latitude' ? (value < 0 ? 'S' : 'N') : value < 0 ? 'W' : 'E'
  return `${degrees}° ${minutes.toFixed(4)}′ ${hemisphere}`
}
