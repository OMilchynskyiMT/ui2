import { shallowRef } from 'vue'

import type { Permission, UserRole } from './user'

export const SESSION_STORAGE_KEY = 'session'

export type UserSession = {
  readonly user: string
  readonly role: UserRole
  readonly isRemote: boolean
  readonly permissions: Permission[]
}

const user = shallowRef<UserSession>()

const set = (session: UserSession): void => {
  user.value = session
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

const remove = (): void => {
  user.value = undefined
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

const restore = (): void => {
  const session = localStorage.getItem(SESSION_STORAGE_KEY)
  if (session !== null) {
    try {
      user.value = JSON.parse(session)
    } catch (error) {
      console.error('No valid user data found in local storage:', error)
    }
  }
}

const isActive = (): boolean => {
  return user.value?.user !== undefined
}

export const useUserSession = () => ({
  set,
  remove,
  restore,
  isActive,
})
