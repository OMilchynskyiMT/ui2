import { computed, readonly, ref } from 'vue'

export type Scheme = 'light' | 'dark'
export type RawScheme = Scheme | 'system'

const STORAGE_KEY = 'color-scheme'
const SYSTEM_QUERY = '(prefers-color-scheme: dark)'

const rawScheme = ref<RawScheme>('system')
const systemScheme = ref<Scheme>('light')
const scheme = computed<Scheme>(() => (rawScheme.value === 'system' ? systemScheme.value : rawScheme.value))

let isInitialized = false
let mediaQuery: MediaQueryList | undefined

const isColorScheme = (value: unknown): value is RawScheme => {
  return ['light', 'dark', 'system'].includes(String(value))
}

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
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return isColorScheme(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

const storeScheme = (value: RawScheme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // persistence is optional, the active color scheme still changes
  }
}

const handleStorage = (event: StorageEvent): void => {
  if (event.key !== STORAGE_KEY) return

  rawScheme.value = isColorScheme(event.newValue) ? event.newValue : 'system'
  applyScheme()
}

export const initializeColorScheme = (): void => {
  if (isInitialized) return
  isInitialized = true

  mediaQuery = matchMedia(SYSTEM_QUERY)
  rawScheme.value = readStoredScheme()
  systemScheme.value = mediaQuery.matches ? 'dark' : 'light'
  applyScheme()

  mediaQuery.addEventListener('change', updateSystemScheme)
  addEventListener('storage', handleStorage)
}

const setRawScheme = (value: RawScheme): void => {
  rawScheme.value = value
  applyScheme()
  storeScheme(value)
}

const toggleScheme = (): void => {
  setRawScheme(scheme.value === 'dark' ? 'light' : 'dark')
}

export const useColorScheme = () => ({
  rawScheme: readonly(rawScheme),
  scheme: readonly(scheme),
  setRawScheme,
  toggleScheme,
})
