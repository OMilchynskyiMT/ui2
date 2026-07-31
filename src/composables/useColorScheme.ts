import { computed, readonly, type Ref, ref } from 'vue'

export type Scheme = 'light' | 'dark'
export type RawScheme = Scheme | 'system'

type UseColorScheme = {
  rawScheme: Readonly<Ref<RawScheme>>
  setRawScheme: (scheme: RawScheme) => void
  scheme: Readonly<Ref<Scheme>>
  toggleScheme: () => void
}

const STORAGE_KEY = 'color-scheme'
const SYSTEM_QUERY = '(prefers-color-scheme: dark)'

const rawScheme = ref<RawScheme>('system')
const systemScheme = ref<Scheme>('light')

let mediaQuery: MediaQueryList | undefined

const isColorScheme = (value: unknown): value is RawScheme => {
  return ['light', 'dark', 'system'].includes(String(value))
}

const scheme = computed<Scheme>(() => {
  return rawScheme.value === 'system' ? systemScheme.value : rawScheme.value
})

const applyScheme = (): void => {
  document.documentElement.dataset.scheme = scheme.value
}

const updateSystemScheme = (): void => {
  systemScheme.value = mediaQuery?.matches ? 'dark' : 'light'

  if (rawScheme.value === 'system') {
    applyScheme()
  }
}

const readStoredScheme = (): RawScheme => {
  const value = localStorage.getItem(STORAGE_KEY)
  return isColorScheme(value) ? value : 'system'
}

const initialize = (): void => {
  if (mediaQuery) {
    return
  }

  // eslint-disable-next-line unicorn/no-top-level-assignment-in-function
  mediaQuery = matchMedia(SYSTEM_QUERY)
  rawScheme.value = readStoredScheme()
  updateSystemScheme()
  applyScheme()

  mediaQuery.addEventListener('change', updateSystemScheme)

  addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY) {
      return
    }

    rawScheme.value = isColorScheme(event.newValue) ? event.newValue : 'system'
    applyScheme()
  })
}

const setRawScheme = (value: RawScheme): void => {
  rawScheme.value = value
  localStorage.setItem(STORAGE_KEY, value)
  applyScheme()
}

const toggleScheme = (): void => {
  setRawScheme(scheme.value === 'dark' ? 'light' : 'dark')
}

export const useColorScheme = (): UseColorScheme => {
  initialize()

  return {
    rawScheme: readonly(rawScheme),
    scheme: readonly(scheme),
    setRawScheme,
    toggleScheme,
  }
}
