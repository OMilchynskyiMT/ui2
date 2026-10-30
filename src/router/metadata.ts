import type { RouteLocationNormalizedLoaded, RouteRecordNormalized } from 'vue-router'

import type { RouteMetadataValue } from './types'

export const resolveRouteMetadataValue = (
  value: RouteMetadataValue | undefined,
  route: RouteLocationNormalizedLoaded
): string | undefined => (typeof value === 'function' ? value(route) : value)

const findMetadata = (
  route: RouteLocationNormalizedLoaded,
  getter: (record: RouteRecordNormalized) => RouteMetadataValue | undefined
): string | undefined => {
  for (const record of route.matched.toReversed()) {
    const value = resolveRouteMetadataValue(getter(record), route)
    if (value) return value
  }

  return undefined
}

export const resolveRouteMetadata = (route: RouteLocationNormalizedLoaded) => ({
  title: findMetadata(route, record => record.meta.title),
  description: findMetadata(route, record => record.meta.description),
})
