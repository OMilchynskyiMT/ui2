import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'

export type RouteMetadataValue<T = string> = T | ((route: RouteLocationNormalizedLoaded) => T | undefined)
export type BreadcrumbTarget = RouteLocationRaw | false

export type BreadcrumbMetadata =
  | RouteMetadataValue
  | {
      label: RouteMetadataValue
      to?: BreadcrumbTarget | ((route: RouteLocationNormalizedLoaded) => BreadcrumbTarget | undefined)
    }
