import { http } from '@/lib/http'
import type { PermissionsList } from '@/models/user/permissions'

export const getPermissions = async (): Promise<PermissionsList> => {
  const { data } = await http.get<PermissionsList>('/api/permissions')
  return data
}
