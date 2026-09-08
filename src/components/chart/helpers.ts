export const resolveColor = (color: string): string => {
  if (!color.startsWith('--')) return color
  return getComputedStyle(document.documentElement).getPropertyValue(color).trim()
}
