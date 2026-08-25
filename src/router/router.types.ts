import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'

export type BreadcrumbLabel = string | ((route: RouteLocationNormalizedLoaded) => string | undefined)
export type BreadcrumbTarget = RouteLocationRaw | false

export type BreadcrumbMetadata =
  | BreadcrumbLabel
  | {
      label: BreadcrumbLabel
      to?: BreadcrumbTarget | ((route: RouteLocationNormalizedLoaded) => BreadcrumbTarget | undefined)
    }
