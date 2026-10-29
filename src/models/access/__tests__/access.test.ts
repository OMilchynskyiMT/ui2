import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import type { DeviceSystem } from '@/models/system/types'
import { hasPermission, type PermissionsList } from '@/models/user/permissions'
import { useDeviceSystem } from '@/state/deviceSystem'
import { useUserSession } from '@/state/userSession'

import { checkAccess, useAccess } from '../access'

const permissions = {
  dhcp: [true, false, true, false, true],
  ni: [true, false, false, false, false],
  smtp: [true, false, false, false, false],
} as PermissionsList

beforeEach(() => {
  vi.stubGlobal('localStorage', { setItem: vi.fn(), removeItem: vi.fn() })
  useUserSession().set({ user: 'operator', role: 'user', isRemote: false, permissions })
})

afterEach(() => {
  useUserSession().remove()
  useDeviceSystem().clear()
  vi.unstubAllGlobals()
})

it('maps API permission indices without confusing Get and Visible', () => {
  expect(hasPermission(permissions, 'dhcp')).toBe(true)
  expect(hasPermission(permissions, { key: 'dhcp', action: 'edit' })).toBe(false)
  expect(hasPermission(permissions, { key: 'dhcp', action: 'add' })).toBe(true)
  expect(hasPermission(permissions, { key: 'ni', action: 'get' })).toBe(true)
  expect(hasPermission(permissions, 'ni')).toBe(false)
  expect(hasPermission(permissions, 'smtp')).toBe(false)
  expect(hasPermission(permissions, 'alert')).toBe(false)
  expect(hasPermission(permissions, { key: 'dhcp', action: ['get', 'add', 'visible'] })).toBe(true)
  expect(hasPermission(permissions, { key: 'dhcp', action: ['get', 'edit'] })).toBe(false)
  expect(hasPermission(permissions, { key: 'dhcp', action: ['get', 'edit', 'add', 'remove', 'visible'] })).toBe(false)
  expect(hasPermission(permissions, { key: 'dhcp', action: [] })).toBe(false)
  expect(hasPermission(permissions as Readonly<PermissionsList>, { key: 'dhcp', action: ['get'] })).toBe(true)
})

it('requires every constraint from parent and child, including dependencies', () => {
  const parent = { permissions: ['dhcp'] as const }
  const child = {
    permissions: [
      { key: 'ni', action: ['get'] },
      { key: 'dhcp', action: ['get', 'add', 'visible'] },
    ],
  } as const
  expect(checkAccess([parent, child])).toBe('allowed')
  expect(useAccess().can(child)).toBe(true)
  expect(checkAccess([parent, { permissions: ['smtp'] }])).toBe('forbidden')
  expect(checkAccess([parent, { permissions: [{ key: 'dhcp', action: ['get', 'remove'] }] }])).toBe('forbidden')
})

it('does not infer an unavailable capability from missing device data', () => {
  expect(checkAccess([{ capabilities: ['software.tunnels.ipsec'] }])).toBe('unknown-capabilities')
  useDeviceSystem().set({
    capabilities: {},
    softCapabilities: { tunnels: { gre: false, ipsec: true, openvpn: false } },
  } as DeviceSystem)
  expect(checkAccess([{ capabilities: ['software.tunnels.ipsec'] }])).toBe('allowed')
  expect(checkAccess([{ capabilities: ['software.tunnels.gre'] }])).toBe('unsupported')
  expect(checkAccess([{ capabilities: ['software.tunnels.ipsec', 'software.tunnels.gre'] }])).toBe('unsupported')
})

it('treats a missing session as unauthenticated, not permitted', () => {
  useUserSession().remove()
  expect(checkAccess([{ permissions: ['dhcp'] }])).toBe('unauthenticated')
  expect(checkAccess([{}])).toBe('allowed')
})
