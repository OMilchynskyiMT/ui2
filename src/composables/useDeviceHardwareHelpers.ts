export const useSnapToDevicePixel = (value: number): number => {
  const ratio = globalThis.devicePixelRatio || 1
  return Math.round(value * ratio) / ratio
}
