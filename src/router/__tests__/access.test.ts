import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { getSystem } from '@/api/system'
import type { DeviceSystem } from '@/models/system/types'
import type { PermissionsList } from '@/models/user/permissions'
import { useUserSession } from '@/state/userSession'

import { canVisitRoute, installAccessGuard } from '../access'

vi.mock('@/api/system', () => ({ getSystem: vi.fn() }))

const permissions = {
  'smtp/maillog': [true, false, false, false, true],
  smtp: [true, false, false, false, false],
} as PermissionsList

const system = {
  capabilities: {},
  softCapabilities: { smtp: true, tunnels: { gre: false, ipsec: true, openvpn: false } },
} as DeviceSystem

const createTestRouter = () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/access-denied', name: 'access-denied', component: {} },
      { path: '/feature-unavailable', name: 'feature-unavailable', component: {} },
      { path: '/public', name: 'public', component: {} },
      {
        path: '/smtp',
        component: {},
        meta: { capabilities: ['software.smtp'] },
        children: [
          { path: 'settings', name: 'smtp-settings', component: {}, meta: { permissions: ['smtp'] } },
          {
            path: 'log',
            name: 'smtp-log',
            component: {},
            meta: { permissions: [{ key: 'smtp/maillog', action: ['get', 'visible'] }] },
          },
        ],
      },
    ],
  })
  installAccessGuard(router)
  return router
}

beforeEach(() => {
  vi.stubGlobal('localStorage', { setItem: vi.fn(), removeItem: vi.fn() })
  useUserSession().set({ user: 'operator', role: 'user', isRemote: false, permissions })
  vi.mocked(getSystem).mockResolvedValue(system)
})

afterEach(() => {
  useUserSession().remove()
  vi.resetAllMocks()
  vi.unstubAllGlobals()
})

it('lets mail-log-only users enter their permitted child when the parent capability exists', async () => {
  const router = createTestRouter()
  await router.push({ name: 'smtp-log' })
  expect(router.currentRoute.value.name).toBe('smtp-log')
  expect(getSystem).toHaveBeenCalledTimes(1)
  expect(canVisitRoute(router, { name: 'smtp-log' })).toBe(true)
})

it('denies a sibling without its permission before making a system request', async () => {
  const router = createTestRouter()
  await router.push({ name: 'smtp-settings' })
  expect(router.currentRoute.value.name).toBe('access-denied')
  expect(getSystem).not.toHaveBeenCalled()
  expect(canVisitRoute(router, { name: 'smtp-settings' })).toBe(false)
  expect(canVisitRoute(router, { name: 'public' })).toBe(true)
})

it('does not allow child routes to override a missing parent capability', async () => {
  vi.mocked(getSystem).mockResolvedValue({ ...system, softCapabilities: { ...system.softCapabilities, smtp: false } })
  const router = createTestRouter()
  await router.push({ name: 'smtp-log' })
  expect(router.currentRoute.value.name).toBe('feature-unavailable')
})

it('fails closed when device capabilities cannot be retrieved', async () => {
  vi.mocked(getSystem).mockRejectedValue(new Error('offline'))
  const router = createTestRouter()
  await router.push({ name: 'smtp-log' })
  expect(router.currentRoute.value.name).toBe('feature-unavailable')
})

it('reports an expired session as an authorization failure, not an unsupported feature', async () => {
  vi.mocked(getSystem).mockImplementation(() => {
    useUserSession().expire()
    return Promise.reject(new Error('Session expired'))
  })
  const router = createTestRouter()
  await router.push({ name: 'smtp-log' })
  expect(router.currentRoute.value.name).toBe('access-denied')
})

it('rejects unauthenticated users without loading the device', async () => {
  useUserSession().remove()
  const router = createTestRouter()
  await router.push({ name: 'smtp-log' })
  expect(router.currentRoute.value.name).toBe('access-denied')
  expect(getSystem).not.toHaveBeenCalled()
})

it('leaves public demo routes unrestricted without fetching system information', async () => {
  useUserSession().remove()
  const router = createTestRouter()
  await router.push({ name: 'public' })
  expect(router.currentRoute.value.name).toBe('public')
  expect(getSystem).not.toHaveBeenCalled()
})
