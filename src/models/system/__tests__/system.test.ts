import { afterEach, expect, it, vi } from 'vitest'

import { getSystem } from '@/api/system'
import { useDeviceSystem } from '@/state/deviceSystem'

import { hasCapability, loadSystem, useCapabilities } from '../system'
import type { DeviceSystem } from '../types'

const system: DeviceSystem = {
  capabilities: {
    bluetooth: false,
    cell: true,
    din: false,
    dout: false,
    ethSwitch: false,
    extUsb: false,
    gps: false,
    lora: false,
    serial: true,
    wifi: true,
  },
  softCapabilities: {
    customUserRoles: false,
    ddns: false,
    docker: false,
    licensing: false,
    loraCloudConnector: false,
    loraNetworkServer: false,
    modbusSlave: false,
    mqttBridge: false,
    nodeRed: false,
    notifications: false,
    packageManagement: false,
    radius: false,
    resetButton: false,
    scada: false,
    smtp: true,
    snmp: false,
    staticRoutes: false,
    trustedIp: false,
    tunnels: { gre: false, ipsec: true, openvpn: false },
  },
}

vi.mock('@/api/system', () => ({ getSystem: vi.fn() }))

afterEach(() => {
  useDeviceSystem().clear()
  vi.resetAllMocks()
})

it('addresses hardware, software, and nested tunnel flags uniformly', () => {
  expect(hasCapability(system, 'hardware.wifi')).toBe(true)
  expect(hasCapability(system, 'software.smtp')).toBe(true)
  expect(hasCapability(system, 'software.tunnels.ipsec')).toBe(true)
  expect(hasCapability(system, 'software.tunnels.gre')).toBe(false)
  expect(hasCapability(undefined, 'hardware.wifi')).toBe(false)
  expect(useCapabilities().has('software.smtp')).toBe(false)
  useDeviceSystem().set(system)
  expect(useCapabilities().has('software.smtp')).toBe(true)
})

it('caches system information, deduplicates loads, and allows refresh', async () => {
  vi.mocked(getSystem).mockResolvedValue(system)
  const [first, second] = await Promise.all([loadSystem(), loadSystem()])
  expect(first).toBe(system)
  expect(second).toBe(system)
  expect(getSystem).toHaveBeenCalledTimes(1)

  await loadSystem()
  expect(getSystem).toHaveBeenCalledTimes(1)
  await loadSystem(true)
  expect(getSystem).toHaveBeenCalledTimes(2)
})

it('does not cache an in-flight result after the session changes', async () => {
  const { promise, resolve } = Promise.withResolvers<DeviceSystem>()
  vi.mocked(getSystem).mockReturnValueOnce(promise)
  const request = loadSystem()
  useDeviceSystem().clear()
  resolve(system)
  await request
  expect(useDeviceSystem().current.value).toBeUndefined()
})

it('retries after a failed request', async () => {
  vi.mocked(getSystem).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(system)
  await expect(loadSystem()).rejects.toThrow('offline')
  await expect(loadSystem()).resolves.toBe(system)
  expect(getSystem).toHaveBeenCalledTimes(2)
})
