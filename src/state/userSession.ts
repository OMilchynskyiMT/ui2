import { readonly, ref } from 'vue'

export const SESSION_STORAGE_KEY = 'session'

export type SystemUserRole = 'admin' | 'user' | 'guest'
export type UserRole = SystemUserRole | (string & {})

export type UserSession = {
  readonly user: string
  readonly role: UserRole
  readonly isRemote: boolean
  readonly isPasswordExpired: boolean
}

const user = ref<UserSession>()
const isExpired = ref(false)

const isUserSession = (value: unknown): value is UserSession => {
  if (typeof value !== 'object' || value === null) return false

  const session = value as Record<PropertyKey, unknown>
  return (
    typeof session.user === 'string' &&
    typeof session.role === 'string' &&
    typeof session.isRemote === 'boolean' &&
    typeof session.isPasswordExpired === 'boolean'
  )
}

const store = (session: UserSession): void => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Storage is best-effort. Keep the in-memory session usable.
  }
}

const clearStored = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Storage is best-effort. Keep the in-memory session usable.
  }
}

const set = (session: UserSession): void => {
  user.value = session
  isExpired.value = false
  store(session)
}

const remove = (): void => {
  user.value = undefined
  isExpired.value = false
  clearStored()
}

const expire = (): void => {
  user.value = undefined
  isExpired.value = true
  clearStored()
}

const restore = (): void => {
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
  } catch {
    // Invalid persisted data is discarded below.
  }

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
  isExpired: readonly(isExpired),
}

export const useUserSession = () => session
