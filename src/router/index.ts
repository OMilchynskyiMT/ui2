import { createRouter, createWebHashHistory, type Router } from 'vue-router'

import { applyPageMetadata } from '@/composables/usePageMeta'

export const createAppRouter = async (): Promise<Router> => {
  const { routes } = import.meta.env.MODE === 'demo' ? await import('@/demo/routes') : await import('./device')

  const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes,
  })

  if (import.meta.env.MODE !== 'demo') {
    const { installAccessGuard } = await import('./access')
    installAccessGuard(router)
  }

  router.afterEach((to, _from, failure) => {
    if (!failure) applyPageMetadata(to)
  })

  return router
}
