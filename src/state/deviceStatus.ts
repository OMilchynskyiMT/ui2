import { readonly, shallowRef } from 'vue'

import type { DeviceStatus } from '@/models/device/deviceStatus.types'

const current = shallowRef<DeviceStatus>()
const error = shallowRef<unknown>()
const lastUpdated = shallowRef<Date>()

// NOTE: prevent results from a previous session from restoring status after logout
let revision = 0
let requestController = new AbortController()

const set = (status: DeviceStatus): void => {
  current.value = status
  error.value = undefined
  lastUpdated.value = new Date()
}

const setError = (failure: unknown): void => {
  error.value = failure
}

const clear = (): void => {
  requestController.abort()
  requestController = new AbortController()
  revision += 1
  current.value = undefined
  error.value = undefined
  lastUpdated.value = undefined
}

const deviceStatus = {
  current: readonly(current),
  error: readonly(error),
  lastUpdated: readonly(lastUpdated),
  set,
  setError,
  clear,
  getRevision: () => revision,
  getSignal: () => requestController.signal,
}

export const useDeviceStatusState = () => deviceStatus
