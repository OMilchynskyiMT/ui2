import type { BreadcrumbMetadata } from '../src/router/router.types'

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumb?: BreadcrumbMetadata
  }
}
