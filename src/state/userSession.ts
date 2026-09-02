import { ref } from 'vue'

import type { User } from '@/models/user/user'

export const SESSION_STORAGE_KEY = 'session'

export type UserSession = User

const user = ref<UserSession>()
const isExpired = ref(false)

const set = (session: UserSession): void => {
  user.value = session
  isExpired.value = false
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

const remove = (): void => {
  user.value = undefined
  isExpired.value = false
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

const expire = (): void => {
  remove()
  isExpired.value = true
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
  expire,
  restore,
  isActive,
  isExpired,
})
