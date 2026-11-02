import { http } from '@/lib/http'
import type { DeviceStatus, DeviceStatusMessage } from '@/models/device/deviceStatus.types'

type DeviceStatusResponse = {
  status: DeviceStatusMessage[]
  system_dbDirty: boolean
}

// inactivity requests must not extend the user's device session
export const getDeviceStatus = async (signal?: AbortSignal): Promise<DeviceStatus> => {
  const { data } = await http.get<DeviceStatusResponse>('/api', {
    params: { fields: 'status,system/dbDirty', inactivity: true },
    timeout: 7000,
    signal,
  })

  return { dbDirty: data.system_dbDirty, messages: data.status }
}
