import { readonly, ref } from 'vue'

import type { PermissionsList } from '@/models/user/permissions'
import { useDeviceStatusState } from '@/state/deviceStatus'
import { useDeviceSystem } from '@/state/deviceSystem'

export const SESSION_STORAGE_KEY = 'session'

export type SystemUserRole = 'admin' | 'user' | 'guest'
export type UserRole = SystemUserRole | (string & {})

export type UserSession = {
  readonly user: string
  readonly role: UserRole
  readonly isRemote: boolean
  readonly permissions: PermissionsList
}

const user = ref<UserSession>()
const isExpired = ref(false)

const isUserSession = (value: unknown): value is UserSession => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false

  const session = value as Record<PropertyKey, unknown>
  const permissions = session.permissions
  return (
    typeof session.user === 'string' &&
    typeof session.role === 'string' &&
    typeof session.isRemote === 'boolean' &&
    typeof permissions === 'object' &&
    permissions !== null &&
    !Array.isArray(permissions) &&
    Object.values(permissions as Record<string, unknown>).every(
      flags => Array.isArray(flags) && flags.length === 5 && flags.every((flag: unknown) => typeof flag === 'boolean')
    )
  )
}

const store = (session: UserSession): void => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {}
}

const clearStored = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {}
}

const set = (session: UserSession): void => {
  useDeviceSystem().clear()
  useDeviceStatusState().clear()
  user.value = session
  isExpired.value = false
  store(session)
}

const remove = (): void => {
  useDeviceSystem().clear()
  useDeviceStatusState().clear()
  user.value = undefined
  isExpired.value = false
  clearStored()
}

const expire = (): void => {
  useDeviceSystem().clear()
  useDeviceStatusState().clear()
  user.value = undefined
  isExpired.value = true
  clearStored()
}

const restore = (): void => {
  useDeviceSystem().clear()
  useDeviceStatusState().clear()
  isExpired.value = false

  let stored: string | null
  try {
    stored = localStorage.getItem(SESSION_STORAGE_KEY)
  } catch {
    user.value = undefined
    return
  }

  if (stored === null) {
    user.value = undefined
    return
  }

  try {
    const session: unknown = JSON.parse(stored)
    if (isUserSession(session)) {
      user.value = session
      return
    }
  } catch {}

  user.value = undefined
  clearStored()
}

const isActive = (): boolean => user.value !== undefined

const session = {
  set,
  remove,
  expire,
  restore,
  isActive,
  current: readonly(user),
  isExpired: readonly(isExpired),
}

export const useUserSession = () => session
