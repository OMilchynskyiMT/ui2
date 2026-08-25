import type { RouteLocationNormalizedLoaded, RouteRecordNormalized } from 'vue-router'

import type { RouteMetadataValue } from './types'

const APPLICATION_TITLE = 'MT-test-UI2'
const APPLICATION_TITLE_SEPARATOR = '·'

const resolveValue = (
  value: RouteMetadataValue<string> | undefined,
  route: RouteLocationNormalizedLoaded
): string | undefined => {
  return typeof value === 'function' ? value(route) : value
}

const findMetadata = (
  route: RouteLocationNormalizedLoaded,
  getter: (record: RouteRecordNormalized) => RouteMetadataValue | undefined
): string | undefined => {
  for (const record of route.matched.toReversed()) {
    const value = resolveValue(getter(record), route)

    if (value) return value
  }

  return undefined
}

const setMeta = (name: string, content: string | undefined): void => {
  const selector = `meta[name="${name}"]`
  const existing = document.head.querySelector<HTMLMetaElement>(selector)

  if (!content) {
    existing?.remove()
    return
  }

  const element = existing ?? document.createElement('meta')
  element.name = name
  element.content = content

  if (!existing) {
    document.head.append(element)
  }
}

export const applyPageMetadata = (route: RouteLocationNormalizedLoaded): void => {
  const title = findMetadata(route, record => record.meta.title)
  const description = findMetadata(route, record => record.meta.description)
  document.title = title ? `${title} ${APPLICATION_TITLE_SEPARATOR} ${APPLICATION_TITLE}` : APPLICATION_TITLE
  setMeta('description', description)
}
