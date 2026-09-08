import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'

import { type PageModelOptions, usePageModel } from '../usePageModel'

type Settings = {
  hostname: string
  enabled: boolean
}

const createPage = (options: PageModelOptions<Settings>) => {
  const scope = effectScope()
  const page = scope.run(() =>
    usePageModel({
      ...options,
      immediate: false,
      navigation: false,
    })
  )

  if (!page) throw new Error('Unable to create page model')

  return { page, scope }
}

it('loads data, tracks edits, resets them, and commits a new baseline', async () => {
  const loader = vi.fn<() => Promise<Settings>>().mockResolvedValue({ hostname: 'router', enabled: true })
  const { page, scope } = createPage({ load: loader })

  await expect(page.load()).resolves.toBe(true)
  expect(page.ready.value).toBe(true)
  expect(page.data.value).toEqual({ hostname: 'router', enabled: true })
  expect(page.dirty.value).toBe(false)

  page.data.value!.hostname = 'gateway'
  expect(page.dirty.value).toBe(true)

  page.reset()
  expect(page.data.value).toEqual({ hostname: 'router', enabled: true })
  expect(page.dirty.value).toBe(false)

  page.data.value!.enabled = false
  page.commit()
  expect(page.dirty.value).toBe(false)

  page.data.value!.hostname = 'edge'
  page.commit({ hostname: 'server', enabled: true })
  expect(page.data.value).toEqual({ hostname: 'server', enabled: true })
  expect(page.dirty.value).toBe(false)

  scope.stop()
})

it('does not reload dirty data when discard confirmation is rejected', async () => {
  const loader = vi.fn<() => Promise<Settings>>().mockResolvedValue({ hostname: 'router', enabled: true })
  const confirmDiscard = vi.fn(() => false)
  const { page, scope } = createPage({ load: loader, confirmDiscard })

  await page.load()
  page.data.value!.hostname = 'unsaved'

  await expect(page.reload()).resolves.toBe(false)
  expect(confirmDiscard).toHaveBeenCalledTimes(1)
  expect(loader).toHaveBeenCalledTimes(1)
  expect(page.data.value?.hostname).toBe('unsaved')
  expect(page.dirty.value).toBe(true)

  scope.stop()
})

it('can explicitly discard dirty data without asking for confirmation', async () => {
  const loader = vi
    .fn()
    .mockResolvedValueOnce({ hostname: 'router', enabled: true })
    .mockResolvedValueOnce({ hostname: 'server', enabled: false })
  const confirmDiscard = vi.fn(() => false)
  const { page, scope } = createPage({ load: loader, confirmDiscard })

  await page.load()
  page.data.value!.hostname = 'unsaved'

  await expect(page.reload({ discardChanges: true })).resolves.toBe(true)
  expect(confirmDiscard).not.toHaveBeenCalled()
  expect(page.data.value).toEqual({ hostname: 'server', enabled: false })
  expect(page.dirty.value).toBe(false)

  scope.stop()
})

it('preserves edits made while a refresh is in flight', async () => {
  const refresh = Promise.withResolvers<Settings>()
  const loader = vi
    .fn()
    .mockResolvedValueOnce({ hostname: 'router', enabled: true })
    .mockImplementationOnce(() => refresh.promise)
  const { page, scope } = createPage({ load: loader })

  await page.load()
  const reload = page.reload()

  await Promise.resolve()
  expect(page.refreshing.value).toBe(true)
  page.data.value!.hostname = 'edited-while-loading'
  refresh.resolve({ hostname: 'server', enabled: false })

  await expect(reload).resolves.toBe(false)
  expect(page.data.value).toEqual({ hostname: 'edited-while-loading', enabled: true })
  expect(page.dirty.value).toBe(true)

  scope.stop()
})

it('distinguishes initial load failures from refresh failures', async () => {
  const initialFailure = new Error('Initial load failed')
  const refreshFailure = new Error('Refresh failed')
  const loader = vi
    .fn()
    .mockRejectedValueOnce(initialFailure)
    .mockResolvedValueOnce({ hostname: 'router', enabled: true })
    .mockRejectedValueOnce(refreshFailure)
  const { page, scope } = createPage({ load: loader })

  await expect(page.load()).rejects.toBe(initialFailure)
  expect(page.loadError.value).toBe(initialFailure)
  expect(page.refreshError.value).toBeUndefined()

  await expect(page.load()).resolves.toBe(true)
  expect(page.ready.value).toBe(true)

  await expect(page.reload()).rejects.toBe(refreshFailure)
  expect(page.loadError.value).toBeUndefined()
  expect(page.refreshError.value).toBe(refreshFailure)
  expect(page.data.value).toEqual({ hostname: 'router', enabled: true })

  scope.stop()
})
