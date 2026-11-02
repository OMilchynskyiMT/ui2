import { getDeviceStatus } from '@/api/deviceStatus'
import { usePolling } from '@/composables/usePolling'
import { useDeviceStatusState } from '@/state/deviceStatus'

import type { DeviceStatus } from './deviceStatus.types'

const STATUS_POLL_INTERVAL = 8000
let pending: Promise<DeviceStatus> | undefined
let pendingRevision = -1

const requestStatus = async (revision: number): Promise<DeviceStatus> => {
  const state = useDeviceStatusState()

  try {
    const status = await getDeviceStatus(state.getSignal())
    if (state.getRevision() === revision) state.set(status)
    return status
  } catch (error) {
    if (state.getRevision() === revision) state.setError(error)
    throw error
  } finally {
    if (pendingRevision === revision) pending = undefined
  }
}

// read-only reactive status for any view, widget, or device command
export const useDeviceStatus = () => {
  const { current, error, lastUpdated } = useDeviceStatusState()
  return { current, error, lastUpdated, refresh: refreshDeviceStatus }
}

export const refreshDeviceStatus = (): Promise<DeviceStatus> => {
  const revision = useDeviceStatusState().getRevision()
  // single one request, even when polling and a command request a refresh together
  if (pending && pendingRevision === revision) return pending

  pendingRevision = revision
  pending = requestStatus(revision)
  return pending
}

// NOTE: instatiate once at the application root
// consumers only call useDeviceStatus()
export const useDeviceStatusPolling = () =>
  usePolling(
    async () => {
      try {
        await refreshDeviceStatus()
      } catch {
        // NOTE: failure is available through useDeviceStatus().error
      }
    },
    { interval: STATUS_POLL_INTERVAL, immediate: true }
  )
