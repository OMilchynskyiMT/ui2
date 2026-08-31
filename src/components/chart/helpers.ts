export const resolveColor = (color: string): string => {
  if (!color.startsWith('--')) return color
  const t = getComputedStyle(document.documentElement)
    .getPropertyValue(color)
    .trim()

  console.log('resolved color:', t)
  return t
}
