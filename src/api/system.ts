import { http } from '@/lib/http'
import type { DeviceSystem } from '@/models/system/types'

export const getSystem = async (): Promise<DeviceSystem> => {
  const { data } = await http.get<{ system: DeviceSystem }>('/api', { params: { fields: 'system' } })
  return data.system
}
