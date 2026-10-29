import { readonly, shallowRef } from 'vue'

import type { DeviceSystem } from '@/models/system/types'

const current = shallowRef<DeviceSystem>()
// INFO: tracks state invalidation to prevent stale API responses from
// overwriting system data after a session change or cache reset
let revision = 0

const set = (system: DeviceSystem): void => {
  current.value = system
}

const clear = (): void => {
  revision += 1
  current.value = undefined
}

const deviceSystem = {
  current: readonly(current),
  set,
  clear,
  getRevision: () => revision,
}

export const useDeviceSystem = () => deviceSystem
