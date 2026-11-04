import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { routes as demoRoutes } from '@/demo/routes'

import { routes as deviceRoutes } from '../device'

const routerFor = (routes: typeof demoRoutes) => createRouter({ history: createMemoryHistory(), routes })

describe('application route targets', () => {
  it('reserves production paths and route names for actual device views', () => {
    const router = routerFor(deviceRoutes)

    expect(router.resolve({ name: 'home' }).path).toBe('/')
    expect(router.hasRoute('demo-dashboard')).toBe(false)
    expect(router.hasRoute('demo-inputs')).toBe(false)
    expect(router.getRoutes().some(route => route.path.startsWith('/demo'))).toBe(false)
  })

  it('preserves application demos and component examples on isolated paths', () => {
    const router = routerFor(demoRoutes)

    expect(router.resolve({ name: 'demo-dashboard' }).path).toBe('/demo/application/dashboard')
    expect(router.resolve({ name: 'demo-dhcp-config' }).path).toBe('/demo/application/setup/dhcp/configuration')
    expect(router.resolve({ name: 'demo-smtp-log' }).path).toBe('/demo/application/setup/smtp/log')
    expect(router.resolve({ name: 'demo-inputs' }).path).toBe('/demo/components/inputs')
    expect(router.resolve({ name: 'demo-sign-in' }).path).toBe('/demo/components/sign-in')
    expect(router.hasRoute('home')).toBe(false)

    const names = router
      .getRoutes()
      .map(route => route.name)
      .filter(Boolean)
    expect(new Set(names).size).toBe(names.length)
  })
})
