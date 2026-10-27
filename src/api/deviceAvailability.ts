import { isAxiosError } from 'axios'

import { http, isApiError } from '@/lib/http'

export const TEST_API_PATH = '/api/policy'

export type DeviceAvailabilityOptions = {
  timeout: number
  interval?: number
  initialDelay?: number
  signal?: AbortSignal
}

const abortError = (signal?: AbortSignal): Error =>
  signal?.reason instanceof Error ? signal.reason : new DOMException('Aborted', 'AbortError')

const throwIfAborted = (signal?: AbortSignal): void => {
  if (signal?.aborted) throw abortError(signal)
}

const delay = (duration: number, signal?: AbortSignal): Promise<void> => {
  throwIfAborted(signal)

  return new Promise((resolve, reject) => {
    const onAbort = (): void => {
      clearTimeout(timer)
      reject(abortError(signal))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, duration)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

// API response (even a failure) or HTTP 401/409 means the device answered
export const isDeviceApiAvailable = async (signal?: AbortSignal, timeout = 5000): Promise<boolean> => {
  try {
    await http.get(TEST_API_PATH, { signal, timeout, skipSessionExpiration: true })
    throwIfAborted(signal)
    return true
  } catch (error) {
    throwIfAborted(signal)

    if (isApiError(error)) return true
    if (isAxiosError(error) && error.response) {
      return error.response.status === 401 || error.response.status === 409
    }
    return false
  }
}

// waits until api responds, or the deadline expires, returns only API reachability
export const isDeviceApiAvailableWithin = async (options: DeviceAvailabilityOptions): Promise<boolean> => {
  const { timeout, interval = 2000, initialDelay = 0, signal } = options
  if (
    !Number.isFinite(timeout) ||
    timeout <= 0 ||
    !Number.isFinite(interval) ||
    interval <= 0 ||
    !Number.isFinite(initialDelay) ||
    initialDelay < 0
  ) {
    throw new RangeError('Invalid device availability timing')
  }

  const deadline = Date.now() + timeout
  if (initialDelay > 0) await delay(Math.min(initialDelay, timeout), signal)

  while (Date.now() < deadline) {
    throwIfAborted(signal)
    const remaining = deadline - Date.now()
    if (await isDeviceApiAvailable(signal, Math.min(5000, remaining))) return true

    const pause = Math.min(interval, deadline - Date.now())
    if (pause > 0) await delay(pause, signal)
  }

  throwIfAborted(signal)
  return false
}
