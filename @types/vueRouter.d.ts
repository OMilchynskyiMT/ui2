import type { BreadcrumbMetadata, RouteMetadataValue } from '../src/router/types'

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumb?: BreadcrumbMetadata
    title?: RouteMetadataValue
    description?: RouteMetadataValue
  }
}
