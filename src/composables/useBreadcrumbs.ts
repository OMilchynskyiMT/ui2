import { computed, type ComputedRef } from 'vue'
import { type RouteLocationRaw, type RouteRecordNormalized, useRoute, useRouter } from 'vue-router'

import type { UiBreadcrumbItem } from '@/lib/components/navigation/UiBreadcrumbs.vue'
import { resolveRouteMetadataValue } from '@/router/metadata'
import type { BreadcrumbMetadata, BreadcrumbTarget } from '@/router/types'

import { currentPageTitleOverride } from './usePageMeta'

export type RouterBreadcrumbItem = UiBreadcrumbItem<RouteLocationRaw>

export type UseBreadcrumbs = {
  breadcrumbs: ComputedRef<RouterBreadcrumbItem[]>
}

const getRecordParameters = (record: RouteRecordNormalized, route: ReturnType<typeof useRoute>) => {
  const matches = record.path.matchAll(/:([A-Za-z0-9_]+)/g)
  const names = new Set(
    [...matches].flatMap(match => {
      const name = match[1]
      return name ?? []
    })
  )

  return Object.fromEntries(Object.entries(route.params).filter(([name]) => names.has(name)))
}

const resolveDefaultTarget = (
  record: RouteRecordNormalized,
  route: ReturnType<typeof useRoute>
): RouteLocationRaw | undefined => {
  if (record.name) {
    return {
      name: record.name,
      params: getRecordParameters(record, route),
    }
  }

  return record.path.includes(':') ? undefined : { path: record.path }
}

const resolveMetadata = (
  metadata: Exclude<BreadcrumbMetadata, false> | undefined,
  record: RouteRecordNormalized,
  route: ReturnType<typeof useRoute>
): { label?: string; target?: RouteLocationRaw } => {
  const fallbackLabel = resolveRouteMetadataValue(record.meta.title, route)

  if (metadata === undefined) {
    return { label: fallbackLabel, target: resolveDefaultTarget(record, route) }
  }

  if (typeof metadata === 'string' || typeof metadata === 'function') {
    return {
      label: resolveRouteMetadataValue(metadata, route) ?? fallbackLabel,
      target: resolveDefaultTarget(record, route),
    }
  }

  const configuredTarget: BreadcrumbTarget | undefined =
    typeof metadata.to === 'function' ? metadata.to(route) : metadata.to
  const target = configuredTarget === false ? undefined : (configuredTarget ?? resolveDefaultTarget(record, route))

  return {
    label: resolveRouteMetadataValue(metadata.label, route) ?? fallbackLabel,
    target,
  }
}

export const useBreadcrumbs = (): UseBreadcrumbs => {
  const route = useRoute()
  const router = useRouter()

  const breadcrumbs = computed<RouterBreadcrumbItem[]>(() => {
    return route.matched.flatMap((record, index) => {
      const metadata = record.meta.breadcrumb
      if (metadata === false) return []

      const { label: routeLabel, target } = resolveMetadata(metadata, record, route)
      const current = index === route.matched.length - 1
      const label = current && metadata === undefined ? (currentPageTitleOverride.value ?? routeLabel) : routeLabel
      if (!label) return []

      return {
        key: record.name?.toString() ?? `${index}-${record.path}`,
        label,
        current,
        target,
        href: target ? router.resolve(target).href : undefined,
      }
    })
  })

  return { breadcrumbs }
}
