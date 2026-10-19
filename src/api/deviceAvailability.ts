import { isHttpError } from '@/lib/http'

import { isApiError } from './errors'
import { publicHttp } from './http'

export const TEST_API_PATH = '/api/policy'

export type DeviceAvailabilityOptions = {
  // Maximum time spent waiting, including the initial delay
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

// any successful response, HTTP 401 or HTTP 409 indicates that the device API answered
export const isDeviceApiAvailable = async (signal?: AbortSignal, timeout = 5000): Promise<boolean> => {
  try {
    await publicHttp.get(TEST_API_PATH, { signal, timeout })
    throwIfAborted(signal)
    return true
  } catch (error) {
    throwIfAborted(signal)

    if (isHttpError(error) && error.kind === 'response') {
      return error.response?.status === 401 || error.response?.status === 409
    }
    if (isApiError(error)) return error.httpStatus === 401 || error.httpStatus === 409
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
