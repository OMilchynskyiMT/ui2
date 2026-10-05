import { afterEach, expect, it, vi } from 'vitest'

const loadColorScheme = async (stored: string | null = null, isSystemDark = false) => {
  vi.resetModules()
  const module = await import('../useColorScheme')

  let storedValue = stored
  const storage = {
    getItem: vi.fn(() => storedValue),
    setItem: vi.fn((_key: string, value: string) => {
      storedValue = value
    }),
  }
  const media = {
    matches: isSystemDark,
    addEventListener: vi.fn(),
  }
  const root = { dataset: {} as Record<string, string> }
  const addEventListener = vi.fn()
  const matchMedia = vi.fn(() => media)

  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('matchMedia', matchMedia)
  vi.stubGlobal('document', { documentElement: root })
  vi.stubGlobal('addEventListener', addEventListener)

  return { ...module, storage, media, root, addEventListener, matchMedia }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

it('initializes once from the persisted preference', async () => {
  const colorScheme = await loadColorScheme('dark')

  colorScheme.useColorScheme()
  expect(colorScheme.matchMedia).not.toHaveBeenCalled()

  colorScheme.initializeColorScheme()
  colorScheme.initializeColorScheme()

  expect(colorScheme.useColorScheme().scheme.value).toBe('dark')
  expect(colorScheme.root.dataset.scheme).toBe('dark')
  expect(colorScheme.media.addEventListener).toHaveBeenCalledTimes(1)
  expect(colorScheme.addEventListener).toHaveBeenCalledTimes(1)
})

it('changes the active scheme even when persistence is unavailable', async () => {
  const colorScheme = await loadColorScheme()
  colorScheme.storage.setItem.mockImplementation(() => {
    throw new Error('unavailable')
  })
  colorScheme.initializeColorScheme()

  expect(() => colorScheme.useColorScheme().setRawScheme('dark')).not.toThrow()
  expect(colorScheme.useColorScheme().scheme.value).toBe('dark')
  expect(colorScheme.root.dataset.scheme).toBe('dark')
})
