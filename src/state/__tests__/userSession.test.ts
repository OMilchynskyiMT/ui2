import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { SESSION_STORAGE_KEY, type UserSession, useUserSession } from '../userSession'

const createStorage = (): Storage => {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    // eslint-disable-next-line unicorn/prefer-spread
    key: index => Array.from(values.keys())[index] ?? null,
    removeItem: key => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
}

const storedSession: UserSession = {
  user: 'admin',
  role: 'admin',
  isRemote: false,
  isPasswordExpired: false,
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createStorage())
  useUserSession().remove()
})

afterEach(() => {
  useUserSession().remove()
  vi.unstubAllGlobals()
})

it('restores only a valid persisted session', () => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedSession))

  const session = useUserSession()
  session.restore()

  expect(session.isActive()).toBe(true)
  expect(session.isExpired.value).toBe(false)
})

it('discards invalid persisted session data', () => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user: 'admin' }))

  const session = useUserSession()
  session.restore()

  expect(session.isActive()).toBe(false)
  expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
})

it('keeps the in-memory session usable when persistence fails', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    removeItem: () => {
      throw new Error('unavailable')
    },
    setItem: () => {
      throw new Error('unavailable')
    },
  })

  const session = useUserSession()
  expect(() => session.set(storedSession)).not.toThrow()
  expect(session.isActive()).toBe(true)

  expect(() => session.expire()).not.toThrow()
  expect(session.isActive()).toBe(false)
  expect(session.isExpired.value).toBe(true)
})
