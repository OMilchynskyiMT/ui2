export const isHexColorValid = (color: string): boolean => {
  return /^#(?:[A-Fa-f\d]{3}|[A-Fa-f\d]{6})$/.test(color)
}

export const normalizeHexColor = (color: string, fallback = '#000000'): string => {
  if (!isHexColorValid(color)) return fallback
  if (color.length === 7) return color

  const red = color.charAt(1)
  const green = color.charAt(2)
  const blue = color.charAt(3)
  return `#${red}${red}${green}${green}${blue}${blue}`
}
