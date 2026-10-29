import type { AccessRequirements } from '../src/models/access/access'
import type { BreadcrumbMetadata, RouteMetadataValue } from '../src/router/types'

declare module 'vue-router' {
  interface RouteMeta extends AccessRequirements {
    breadcrumb?: BreadcrumbMetadata
    title?: RouteMetadataValue
    description?: RouteMetadataValue
  }
}
