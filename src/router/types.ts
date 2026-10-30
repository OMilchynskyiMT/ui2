import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'

export type RouteMetadataValue<T = string> = T | ((route: RouteLocationNormalizedLoaded) => T | undefined)
export type BreadcrumbTarget = RouteLocationRaw | false

// missing breadcrumb uses the route title, false - excludes the record
export type BreadcrumbMetadata =
  | false
  | RouteMetadataValue
  | {
      label?: RouteMetadataValue
      to?: BreadcrumbTarget | ((route: RouteLocationNormalizedLoaded) => BreadcrumbTarget | undefined)
    }
