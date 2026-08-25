import { computed, type ComputedRef } from 'vue'
import { type RouteLocationRaw, type RouteRecordNormalized, useRoute, useRouter } from 'vue-router'

import type { MBreadcrumbItem } from '@/lib/components/navigation/MBreadcrumbs.vue'
import type { BreadcrumbMetadata, BreadcrumbTarget, RouteMetadataValue } from '@/router/router.types'

export type RouterBreadcrumbItem = MBreadcrumbItem<RouteLocationRaw>

export type UseBreadcrumbs = {
  breadcrumbs: ComputedRef<RouterBreadcrumbItem[]>
}

const resolveLabel = (label: RouteMetadataValue<string>, route: ReturnType<typeof useRoute>): string | undefined => {
  return typeof label === 'function' ? label(route) : label
}

const getRecordParameters = (record: RouteRecordNormalized, route: ReturnType<typeof useRoute>) => {
  const matches = record.path.matchAll(/:([A-Za-z0-9_]+)/g)
  const names = new Set(
    [...matches].flatMap(match => {
      const name = match[1]
      return name ? [name] : []
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
  metadata: BreadcrumbMetadata,
  record: RouteRecordNormalized,
  route: ReturnType<typeof useRoute>
): { label?: string; target?: RouteLocationRaw } => {
  if (typeof metadata === 'string' || typeof metadata === 'function') {
    return {
      label: resolveLabel(metadata, route),
      target: resolveDefaultTarget(record, route),
    }
  }

  const configuredTarget: BreadcrumbTarget | undefined =
    typeof metadata.to === 'function' ? metadata.to(route) : metadata.to
  const target = configuredTarget === false ? undefined : (configuredTarget ?? resolveDefaultTarget(record, route))

  return {
    label: resolveLabel(metadata.label, route),
    target,
  }
}

export const useBreadcrumbs = (): UseBreadcrumbs => {
  const route = useRoute()
  const router = useRouter()

  const breadcrumbs = computed<RouterBreadcrumbItem[]>(() => {
    return route.matched.flatMap((record, index) => {
      const metadata = record.meta.breadcrumb
      if (!metadata) return []

      const { label, target } = resolveMetadata(metadata, record, route)
      if (!label) return []

      return [
        {
          key: record.name?.toString() ?? `${index}-${record.path}`,
          label,
          target,
          href: target ? router.resolve(target).href : undefined,
        },
      ]
    })
  })

  return { breadcrumbs }
}
