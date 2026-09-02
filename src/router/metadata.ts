import type { RouteLocationNormalizedLoaded, RouteRecordNormalized } from 'vue-router'

import { usePageMeta } from '@/composables/usePageMeta'

import type { RouteMetadataValue } from './types'

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

export const applyPageMetadata = (route: RouteLocationNormalizedLoaded): void => {
  const pageTitle = findMetadata(route, record => record.meta.title)
  const pageDescription = findMetadata(route, record => record.meta.description)

  const { title, description } = usePageMeta()
  title.value = pageTitle ?? ''
  if (pageDescription) description.value = pageDescription
}
