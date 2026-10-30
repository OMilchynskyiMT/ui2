import { computed, type ComputedRef, type MaybeRefOrGetter, onScopeDispose, shallowRef, toValue, watch } from 'vue'
import { type RouteLocationNormalizedLoaded, type RouteRecordNormalized, useRoute } from 'vue-router'

import { resolveRouteMetadata } from '@/router/metadata'

export const APPLICATION_TITLE = 'MT-test-UI2'
export const APPLICATION_TITLE_SEPARATOR = '·'

type PageMetaOptions = {
  title?: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
}

type PageMetaOverride = {
  record: RouteRecordNormalized | undefined
  title: ComputedRef<string | undefined>
  description: ComputedRef<string | undefined>
}

const activeRoute = shallowRef<RouteLocationNormalizedLoaded>()
const overrides = shallowRef<PageMetaOverride[]>([])

const activeOverride = computed(() => {
  return overrides.value.findLast(entry => entry.record === activeRoute.value?.matched.at(-1))
})

const defaults = computed(() =>
  activeRoute.value ? resolveRouteMetadata(activeRoute.value) : { title: undefined, description: undefined }
)

const resolvedPageMeta = computed(() => ({
  title: activeOverride.value?.title.value ?? defaults.value.title ?? '',
  description: activeOverride.value?.description.value ?? defaults.value.description ?? '',
}))

// only the current page's override is eligible for its breadcrumb label
// parent records continue to use their own route metadata
export const currentPageTitleOverride = computed(() => activeOverride.value?.title.value)

// INFO: module is imported by the router, so DOM synchronization is installed lazily on the first successful navigation,
// not as an import-time side effect
let metadataWatcherInstalled = false

// called only after a successful navigation
// previous page override cannot affect the new route while its component is still being unmounted
export const applyPageMetadata = (route: RouteLocationNormalizedLoaded): void => {
  activeRoute.value = route

  if (metadataWatcherInstalled) return
  metadataWatcherInstalled = true

  watch(
    resolvedPageMeta,
    ({ title, description }) => {
      if (typeof document === 'undefined') return

      document.title = title ? `${title} ${APPLICATION_TITLE_SEPARATOR} ${APPLICATION_TITLE}` : APPLICATION_TITLE
      document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    },
    { flush: 'sync', immediate: true }
  )
}

// overrides route metadata using data already owned by the active view
// undefined values fall back to the route defaults
// overrides are released with the view's effect scope, no API requests are performed here
export const usePageMeta = (options: PageMetaOptions): void => {
  const route = useRoute()
  const entry: PageMetaOverride = {
    record: route.matched.at(-1),
    title: computed(() => (options.title === undefined ? undefined : toValue(options.title))),
    description: computed(() => (options.description === undefined ? undefined : toValue(options.description))),
  }

  overrides.value = [...overrides.value, entry]
  onScopeDispose(() => {
    overrides.value = overrides.value.filter(item => item !== entry)
  })
}
