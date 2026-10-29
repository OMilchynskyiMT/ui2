import { hasCapability } from '@/models/system/system'
import type { Capability } from '@/models/system/types'
import { hasPermission, type PermissionRequirement } from '@/models/user/permissions'
import { useDeviceSystem } from '@/state/deviceSystem'
import { useUserSession } from '@/state/userSession'

export type AccessRequirements = {
  permissions?: readonly PermissionRequirement[]
  capabilities?: readonly Capability[]
}

export type AccessResult = 'allowed' | 'unauthenticated' | 'forbidden' | 'unknown-capabilities' | 'unsupported'

// evaluate every matched route record; Vue Router's merged meta would overwrite parent requirements
export const checkAccess = (requirements: readonly AccessRequirements[]): AccessResult => {
  const permissions = requirements.flatMap(requirement => requirement.permissions ?? [])
  const session = useUserSession().current.value

  if (!session && permissions.length > 0) return 'unauthenticated'
  if (permissions.some(permission => !hasPermission(session?.permissions, permission))) return 'forbidden'

  const capabilities = requirements.flatMap(requirement => requirement.capabilities ?? [])
  if (capabilities.length === 0) return 'allowed'

  const system = useDeviceSystem().current.value
  if (!system) return 'unknown-capabilities'
  if (capabilities.some(capability => !hasCapability(system, capability))) return 'unsupported'

  return 'allowed'
}

export const useAccess = () => ({
  can: (requirements: AccessRequirements): boolean => checkAccess([requirements]) === 'allowed',
})
