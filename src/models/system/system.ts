import { getSystem } from '@/api/system'
import { useDeviceSystem } from '@/state/deviceSystem'

import type { Capability, DeviceSystem } from './types'

let pending: Promise<DeviceSystem> | undefined
let pendingRevision = -1

const requestSystem = async (revision: number): Promise<DeviceSystem> => {
  try {
    const system = await getSystem()
    // a request started under an old session must not restore stale capabilities
    const state = useDeviceSystem()
    if (state.getRevision() === revision) state.set(system)
    return system
  } finally {
    if (pendingRevision === revision) pending = undefined
  }
}

export const loadSystem = (shouldRefresh = false): Promise<DeviceSystem> => {
  const state = useDeviceSystem()
  const revision = state.getRevision()

  if (pending && pendingRevision === revision) return pending
  if (!shouldRefresh && state.current.value) return Promise.resolve(state.current.value)

  pendingRevision = revision
  pending = requestSystem(revision)
  return pending
}

export const hasCapability = (system: DeviceSystem | undefined, capability: Capability): boolean => {
  if (!system) return false

  const [scope, ...path] = capability.split('.')
  let value: unknown = scope === 'hardware' ? system.capabilities : system.softCapabilities

  for (const key of path) {
    if (typeof value !== 'object' || value === null || !Object.hasOwn(value, key)) return false
    value = (value as Record<string, unknown>)[key]
  }

  return value === true
}

export const useCapabilities = () => {
  const { current } = useDeviceSystem()

  return {
    current,
    load: loadSystem,
    has: (capability: Capability): boolean => hasCapability(current.value, capability),
  }
}
