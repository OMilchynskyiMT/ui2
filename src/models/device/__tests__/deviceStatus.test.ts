import { effectScope } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { useDeviceStatusState } from '@/state/deviceStatus'

import { useDeviceStatus, useDeviceStatusPolling } from '../deviceStatus'
import type { DeviceStatus } from '../deviceStatus.types'

const { getDeviceStatus } = vi.hoisted(() => ({ getDeviceStatus: vi.fn() }))
vi.mock('@/api/deviceStatus', () => ({ getDeviceStatus }))

const example: DeviceStatus = {
  dbDirty: true,
  messages: [{ guid: 'one', msg: 'Info', timestamp: '07/22/2026 16:27:38', type: 'INFO' }],
}

beforeEach(() => {
  useDeviceStatusState().clear()
  getDeviceStatus.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

it('shares status updates with all consumers and deduplicates concurrent refreshes', async () => {
  const deferred = Promise.withResolvers<DeviceStatus>()
  getDeviceStatus.mockReturnValueOnce(deferred.promise)
  const first = useDeviceStatus()
  const second = useDeviceStatus()

  const a = first.refresh()
  const b = second.refresh()
  expect(getDeviceStatus).toHaveBeenCalledOnce()
  deferred.resolve(example)

  await expect(a).resolves.toBe(example)
  await expect(b).resolves.toBe(example)
  expect(first.current.value).toStrictEqual(example)
  expect(first.current.value).toBe(second.current.value)
  expect(first.lastUpdated.value).toBeInstanceOf(Date)
})

it('keeps the last successful status and exposes polling errors', async () => {
  getDeviceStatus.mockResolvedValueOnce(example).mockRejectedValueOnce(new Error('Network failure'))
  const status = useDeviceStatus()
  await status.refresh()
  const previous = status.current.value

  await expect(status.refresh()).rejects.toThrow('Network failure')
  expect(status.current.value).toBe(previous)
  expect(status.current.value).toStrictEqual(example)
  expect(status.error.value).toMatchObject({ message: 'Network failure' })

  getDeviceStatus.mockResolvedValueOnce({ dbDirty: false, messages: [] })
  await status.refresh()
  expect(status.current.value?.dbDirty).toBe(false)
  expect(status.error.value).toBeUndefined()
})

it('ignores responses from an invalidated session', async () => {
  const deferred = Promise.withResolvers<DeviceStatus>()
  getDeviceStatus.mockReturnValueOnce(deferred.promise)
  const status = useDeviceStatus()

  const oldRequest = status.refresh()
  const oldSignal = getDeviceStatus.mock.lastCall?.[0] as AbortSignal
  useDeviceStatusState().clear()
  expect(oldSignal.aborted).toBe(true)
  getDeviceStatus.mockResolvedValueOnce({ dbDirty: false, messages: [] })
  await status.refresh()

  deferred.resolve(example)
  await oldRequest
  expect(status.current.value?.dbDirty).toBe(false)
  expect(status.current.value?.messages).toEqual([])
})

it('starts one immediate poll, retries failures, and stops when disposed', async () => {
  vi.useFakeTimers()
  getDeviceStatus.mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValue(example)
  const scope = effectScope()
  const polling = scope.run(() => useDeviceStatusPolling())
  if (!polling) throw new Error('Unable to create device status polling')

  polling.start()
  await vi.advanceTimersByTimeAsync(0)
  expect(getDeviceStatus).toHaveBeenCalledOnce()
  expect(useDeviceStatus().error.value).toMatchObject({ message: 'Unavailable' })

  await vi.advanceTimersByTimeAsync(8000)
  expect(getDeviceStatus).toHaveBeenCalledTimes(2)
  expect(useDeviceStatus().current.value).toStrictEqual(example)

  scope.stop()
  await vi.advanceTimersByTimeAsync(16_000)
  expect(getDeviceStatus).toHaveBeenCalledTimes(2)
})
