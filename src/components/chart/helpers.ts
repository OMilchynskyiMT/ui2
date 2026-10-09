export const resolveColor = (color: string): string => {
  if (!color.startsWith('--')) return color

  const probe = document.createElement('span')
  probe.style.color = `var(${color})`
  document.body.append(probe)

  const resolvedColor = getComputedStyle(probe).color
  probe.remove()

  return resolvedColor
}
