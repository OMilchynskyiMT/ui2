import { createApp, effectScope, ref } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  createMemoryHistory,
  createRouter,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw,
  useRoute,
} from 'vue-router'

import { useBreadcrumbs } from '../useBreadcrumbs'
import { APPLICATION_TITLE, applyPageMetadata, usePageMeta } from '../usePageMeta'

const routes: RouteRecordRaw[] = [
  {
    path: '/setup',
    name: 'setup',
    component: {},
    meta: { title: 'Setup', breadcrumb: { to: false } },
    children: [
      {
        path: 'interfaces/:id',
        name: 'interface',
        component: {},
        meta: { title: 'Edit interface', description: 'Interface settings' },
      },
      {
        path: 'advanced/:id',
        name: 'advanced',
        component: {},
        meta: {
          title: (route: RouteLocationNormalizedLoaded) => `Advanced ${String(route.params.id)}`,
          breadcrumb: {
            label: 'Advanced',
            to: (route: RouteLocationNormalizedLoaded) => ({ name: 'interface', params: { id: route.params.id } }),
          },
        },
      },
      {
        path: 'hidden',
        name: 'hidden',
        component: {},
        meta: { title: 'Hidden', breadcrumb: false },
      },
      {
        path: 'unnamed',
        name: 'unnamed',
        component: {},
      },
      {
        path: 'label-only',
        name: 'label-only',
        component: {},
        meta: { title: 'Full page title', breadcrumb: () => undefined },
      },
    ],
  },
  {
    path: '/other',
    name: 'other',
    component: {},
    meta: { title: 'Other', description: 'Other page' },
  },
]

const createTestRouter = async (path: string) => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.afterEach((to, _from, failure) => {
    if (!failure) applyPageMetadata(to)
  })
  const app = createApp({ render: () => null })
  app.use(router)
  await router.push(path)
  await router.isReady()
  return { app, router }
}

const pageDescription = {
  content: '',
  setAttribute: vi.fn((name: string, value: string) => {
    if (name === 'content') pageDescription.content = value
  }),
}

beforeEach(() => {
  pageDescription.content = ''
  pageDescription.setAttribute.mockClear()
  vi.stubGlobal('document', {
    title: '',
    querySelector: (selector: string) => (selector === 'meta[name="description"]' ? pageDescription : null),
  })
})

afterEach(() => vi.unstubAllGlobals())

it('uses route titles as breadcrumb labels and publishes default document metadata', async () => {
  const { app } = await createTestRouter('/setup/interfaces/eth0')
  const scope = effectScope()
  const breadcrumbs = app.runWithContext(() => scope.run(() => useBreadcrumbs()))!.breadcrumbs

  expect(document.title).toBe(`Edit interface · ${APPLICATION_TITLE}`)
  expect(pageDescription.content).toBe('Interface settings')
  expect(breadcrumbs.value.map(item => item.label)).toEqual(['Setup', 'Edit interface'])
  expect(breadcrumbs.value[0]).toMatchObject({ current: false, target: undefined })
  expect(breadcrumbs.value[1]).toMatchObject({ current: true })
  expect(breadcrumbs.value[1]?.href).toContain('/setup/interfaces/eth0')
  scope.stop()
})

it('reacts to page-owned API data and falls back to route defaults when unavailable', async () => {
  const { app } = await createTestRouter('/setup/interfaces/eth0')
  const iface = ref<{ id: string; name: string }>()
  const scope = effectScope()
  const breadcrumbs = app.runWithContext(() =>
    scope.run(() => {
      usePageMeta({
        title: () => (iface.value ? `Edit ${iface.value.name} interface` : undefined),
        description: () => (iface.value ? `Configure ${iface.value.name}` : undefined),
      })
      return useBreadcrumbs()
    })
  )!.breadcrumbs

  expect(document.title).toBe(`Edit interface · ${APPLICATION_TITLE}`)
  iface.value = { id: 'eth0', name: 'Ethernet' }
  expect(document.title).toBe(`Edit Ethernet interface · ${APPLICATION_TITLE}`)
  expect(pageDescription.content).toBe('Configure Ethernet')
  expect(breadcrumbs.value.at(-1)?.label).toBe('Edit Ethernet interface')

  iface.value = undefined
  expect(document.title).toBe(`Edit interface · ${APPLICATION_TITLE}`)
  expect(pageDescription.content).toBe('Interface settings')
  expect(breadcrumbs.value.at(-1)?.label).toBe('Edit interface')

  scope.stop()
})

it('restores route defaults on scope disposal without requiring new navigation', async () => {
  const { app } = await createTestRouter('/setup/interfaces/eth0')
  const title = ref('Custom title')
  const scope = effectScope()
  app.runWithContext(() => scope.run(() => usePageMeta({ title, description: 'Custom description' })))

  expect(document.title).toBe(`Custom title · ${APPLICATION_TITLE}`)
  expect(pageDescription.content).toBe('Custom description')
  scope.stop()
  expect(document.title).toBe(`Edit interface · ${APPLICATION_TITLE}`)
  expect(pageDescription.content).toBe('Interface settings')
})

it('does not allow the previous view to overwrite another route or clear a newer view override', async () => {
  const { app, router } = await createTestRouter('/setup/interfaces/eth0')
  const staleTitle = ref('Edit eth0 interface')
  const oldScope = effectScope()
  app.runWithContext(() => oldScope.run(() => usePageMeta({ title: staleTitle })))

  await router.push('/other')
  expect(document.title).toBe(`Other · ${APPLICATION_TITLE}`)
  staleTitle.value = 'Late API result'
  expect(document.title).toBe(`Other · ${APPLICATION_TITLE}`)

  const newScope = effectScope()
  app.runWithContext(() => newScope.run(() => usePageMeta({ title: 'New override' })))
  oldScope.stop()
  expect(document.title).toBe(`New override · ${APPLICATION_TITLE}`)
  newScope.stop()
  expect(document.title).toBe(`Other · ${APPLICATION_TITLE}`)
})

it('supports the same component instance across parameter changes when the page guards stale resource data', async () => {
  const { app, router } = await createTestRouter('/setup/interfaces/eth0')
  const iface = ref<{ id: string; name: string }>({ id: 'eth0', name: 'Ethernet' })
  const scope = effectScope()
  const breadcrumbs = app.runWithContext(() =>
    scope.run(() => {
      const route = useRoute()
      usePageMeta({ title: () => (iface.value?.id === route.params.id ? `Edit ${iface.value.name}` : undefined) })
      return useBreadcrumbs()
    })
  )!.breadcrumbs

  expect(document.title).toBe(`Edit Ethernet · ${APPLICATION_TITLE}`)
  await router.push('/setup/interfaces/wwan0')
  expect(document.title).toBe(`Edit interface · ${APPLICATION_TITLE}`)
  expect(breadcrumbs.value.at(-1)?.label).toBe('Edit interface')
  iface.value = { id: 'eth0', name: 'Late Ethernet' }
  expect(document.title).toBe(`Edit interface · ${APPLICATION_TITLE}`)
  iface.value = { id: 'wwan0', name: 'Cellular' }
  expect(document.title).toBe(`Edit Cellular · ${APPLICATION_TITLE}`)
  expect(breadcrumbs.value.at(-1)?.label).toBe('Edit Cellular')
  scope.stop()
})

it('honors breadcrumb-specific labels, targets and route title functions', async () => {
  const { app } = await createTestRouter('/setup/advanced/eth0')
  const scope = effectScope()
  const breadcrumbs = app.runWithContext(() => scope.run(() => useBreadcrumbs()))!.breadcrumbs

  expect(document.title).toBe(`Advanced eth0 · ${APPLICATION_TITLE}`)
  expect(breadcrumbs.value.at(-1)).toMatchObject({ label: 'Advanced', current: true })
  expect(breadcrumbs.value.at(-1)?.href).toContain('/setup/interfaces/eth0')
  scope.stop()
})

it('does not mistakenly designate a parent as the current page when the leaf breadcrumb is suppressed', async () => {
  const { app } = await createTestRouter('/setup/hidden')
  const scope = effectScope()
  const breadcrumbs = app.runWithContext(() => scope.run(() => useBreadcrumbs()))!.breadcrumbs
  expect(document.title).toBe(`Hidden · ${APPLICATION_TITLE}`)
  expect(breadcrumbs.value).toMatchObject([{ label: 'Setup', current: false }])
  scope.stop()
})

it('falls back to the route title when a breadcrumb label function returns undefined', async () => {
  const { app } = await createTestRouter('/setup/label-only')
  const scope = effectScope()
  const breadcrumbs = app.runWithContext(() => scope.run(() => useBreadcrumbs()))!.breadcrumbs
  expect(breadcrumbs.value.at(-1)?.label).toBe('Full page title')
  scope.stop()
})

it('does not mark the last visible ancestor as current when a leaf has no title', async () => {
  const { app } = await createTestRouter('/setup/unnamed')
  const scope = effectScope()
  const breadcrumbs = app.runWithContext(() => scope.run(() => useBreadcrumbs()))!.breadcrumbs
  expect(breadcrumbs.value).toMatchObject([{ label: 'Setup', current: false }])
  scope.stop()
})

it('allows a page override to supply the sole label of an otherwise untitled route', async () => {
  const { app } = await createTestRouter('/setup/unnamed')
  const scope = effectScope()
  const breadcrumbs = app.runWithContext(() =>
    scope.run(() => {
      usePageMeta({ title: 'Loaded record' })
      return useBreadcrumbs()
    })
  )!.breadcrumbs
  expect(document.title).toBe(`Loaded record · ${APPLICATION_TITLE}`)
  expect(breadcrumbs.value.at(-1)).toMatchObject({ label: 'Loaded record', current: true })
  scope.stop()
})

it('restores an outer override when a nested metadata owner is disposed', async () => {
  const { app } = await createTestRouter('/other')
  const outer = effectScope()
  const inner = effectScope()
  app.runWithContext(() => outer.run(() => usePageMeta({ title: 'Outer title' })))
  app.runWithContext(() => inner.run(() => usePageMeta({ title: 'Inner title' })))
  expect(document.title).toBe(`Inner title · ${APPLICATION_TITLE}`)
  inner.stop()
  expect(document.title).toBe(`Outer title · ${APPLICATION_TITLE}`)
  outer.stop()
  expect(document.title).toBe(`Other · ${APPLICATION_TITLE}`)
})

it('does not update metadata on aborted navigation and clears missing description on successful navigation', async () => {
  const { router } = await createTestRouter('/other')
  router.beforeEach(to => (to.name === 'hidden' ? false : true))
  await router.push('/setup/hidden')
  expect(document.title).toBe(`Other · ${APPLICATION_TITLE}`)
  expect(pageDescription.content).toBe('Other page')

  await router.push('/setup/advanced/eth0')
  expect(document.title).toBe(`Advanced eth0 · ${APPLICATION_TITLE}`)
  expect(pageDescription.content).toBe('')
})

it('keeps explicit breadcrumb labels independent of dynamic document titles', async () => {
  const { app } = await createTestRouter('/setup/advanced/eth0')
  const scope = effectScope()
  const breadcrumbs = app.runWithContext(() =>
    scope.run(() => {
      usePageMeta({ title: 'Loaded advanced record' })
      return useBreadcrumbs()
    })
  )!.breadcrumbs
  expect(document.title).toBe(`Loaded advanced record · ${APPLICATION_TITLE}`)
  expect(breadcrumbs.value.at(-1)?.label).toBe('Advanced')
  scope.stop()
})
