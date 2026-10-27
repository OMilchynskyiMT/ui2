import { AxiosError, type AxiosResponse } from 'axios'
import { afterEach, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/http'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/lib/http', async importOriginal => ({
  ...(await importOriginal<typeof import('@/lib/http')>()),
  http: { get },
}))

import { isDeviceApiAvailable, isDeviceApiAvailableWithin } from '../deviceAvailability'

const responseError = (status: number): AxiosError =>
  new AxiosError(`HTTP ${status}`, AxiosError.ERR_BAD_RESPONSE, undefined, undefined, {
    status,
    data: undefined,
    headers: {},
  } as AxiosResponse)

afterEach(() => {
  vi.useRealTimers()
  get.mockReset()
})

it('accepts actual API responses, including login and commissioning responses', async () => {
  get
    .mockRejectedValueOnce(responseError(401))
    .mockRejectedValueOnce(responseError(409))
    .mockResolvedValueOnce({ data: {}, status: 200, headers: {} })
    .mockRejectedValueOnce(new ApiError('Login required', 401, 200))
    .mockRejectedValueOnce(responseError(500))

  expect(await isDeviceApiAvailable()).toBe(true)
  expect(await isDeviceApiAvailable()).toBe(true)
  expect(await isDeviceApiAvailable()).toBe(true)
  expect(await isDeviceApiAvailable()).toBe(true)
  expect(await isDeviceApiAvailable()).toBe(false)
  expect(get).toHaveBeenCalledWith('/api/policy', { signal: undefined, timeout: 5000, skipSessionExpiration: true })
})

it('waits for availability with a bounded deadline and no overlapping probes', async () => {
  vi.useFakeTimers()
  get
    .mockRejectedValueOnce(new Error('offline'))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ status: 200 })

  const wait = isDeviceApiAvailableWithin({ timeout: 5000, interval: 1000, initialDelay: 500 })
  await vi.advanceTimersByTimeAsync(2500)
  expect(await wait).toBe(true)
  expect(get).toHaveBeenCalledTimes(3)
})

it('returns false rather than waiting indefinitely', async () => {
  vi.useFakeTimers()
  get.mockRejectedValue(new Error('offline'))

  const wait = isDeviceApiAvailableWithin({ timeout: 2500, interval: 1000 })
  await vi.advanceTimersByTimeAsync(2500)
  expect(await wait).toBe(false)
  expect(get).toHaveBeenCalledTimes(3)
})

it('aborts a pending retry delay', async () => {
  vi.useFakeTimers()
  get.mockRejectedValue(new Error('offline'))
  const controller = new AbortController()
  const wait = isDeviceApiAvailableWithin({ timeout: 10_000, interval: 2000, signal: controller.signal })
  const rejected = expect(wait).rejects.toMatchObject({ name: 'AbortError' })

  await vi.advanceTimersByTimeAsync(100)
  controller.abort()
  await rejected
  expect(get).toHaveBeenCalledTimes(1)
})

it('normalizes non-Error abort reasons', async () => {
  const controller = new AbortController()
  controller.abort('stopped')

  await expect(isDeviceApiAvailableWithin({ timeout: 1000, signal: controller.signal })).rejects.toMatchObject({
    name: 'AbortError',
  })
  expect(get).not.toHaveBeenCalled()
})
