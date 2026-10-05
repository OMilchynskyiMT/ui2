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

it('does not replace dirty data when discard confirmation is rejected', async () => {
  const loader = vi.fn<() => Promise<Settings>>().mockResolvedValue({ hostname: 'router', enabled: true })
  const confirmDiscard = vi.fn(() => false)
  const { page, scope } = createPage({ load: loader, confirmDiscard })

  await page.load()
  page.data.value!.hostname = 'unsaved'

  await expect(page.load()).resolves.toBe(false)
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

  await expect(page.load({ ifDirty: 'discard' })).resolves.toBe(true)
  expect(confirmDiscard).not.toHaveBeenCalled()
  expect(page.data.value).toEqual({ hostname: 'server', enabled: false })
  expect(page.dirty.value).toBe(false)

  scope.stop()
})

it('can skip an automatic refresh while the page is dirty', async () => {
  const loader = vi.fn<() => Promise<Settings>>().mockResolvedValue({ hostname: 'router', enabled: true })
  const confirmDiscard = vi.fn(() => true)
  const { page, scope } = createPage({ load: loader, confirmDiscard })

  await page.load()
  page.data.value!.hostname = 'unsaved'

  await expect(page.load({ ifDirty: 'skip' })).resolves.toBe(false)
  expect(confirmDiscard).not.toHaveBeenCalled()
  expect(loader).toHaveBeenCalledTimes(1)
  expect(page.data.value?.hostname).toBe('unsaved')

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
  const reading = page.load()

  await Promise.resolve()
  expect(page.refreshing.value).toBe(true)
  page.data.value!.hostname = 'edited-while-loading'
  refresh.resolve({ hostname: 'server', enabled: false })

  await expect(reading).resolves.toBe(false)
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

  await expect(page.load()).rejects.toBe(refreshFailure)
  expect(page.loadError.value).toBeUndefined()
  expect(page.refreshError.value).toBe(refreshFailure)
  expect(page.data.value).toEqual({ hostname: 'router', enabled: true })

  scope.stop()
})

it('shares one save request and accepts server normalization', async () => {
  const deferred = Promise.withResolvers<Settings>()
  const saver = vi.fn(() => deferred.promise)
  const { page, scope } = createPage({
    load: () => Promise.resolve({ hostname: 'router', enabled: true }),
    save: saver,
  })
  await page.load()
  page.data.value!.hostname = ' gateway '
  const first = page.save()
  expect(page.save()).toBe(first)
  expect(page.saving.value).toBe(true)
  expect(page.pending.value).toBe(true)
  await Promise.resolve()
  expect(saver).toHaveBeenCalledExactlyOnceWith({ hostname: ' gateway ', enabled: true })
  deferred.resolve({ hostname: 'gateway', enabled: true })
  await expect(first).resolves.toBe(true)
  expect(page.data.value?.hostname).toBe('gateway')
  expect(page.dirty.value).toBe(false)
  expect(page.saving.value).toBe(false)
  scope.stop()
})

it('preserves edits made during saving and resets to the persisted response', async () => {
  const deferred = Promise.withResolvers<Settings>()
  const saver = vi.fn((_value: Settings) => deferred.promise)
  const { page, scope } = createPage({
    load: () => Promise.resolve({ hostname: 'router', enabled: true }),
    save: saver,
  })
  await page.load()
  page.data.value!.hostname = 'submitted'
  const saving = page.save()
  page.data.value!.hostname = 'new edit'
  await Promise.resolve()
  expect(saver.mock.calls[0]?.[0].hostname).toBe('submitted')
  deferred.resolve({ hostname: 'normalized', enabled: false })
  await saving
  expect(page.data.value).toEqual({ hostname: 'new edit', enabled: true })
  expect(page.dirty.value).toBe(true)
  page.reset()
  expect(page.data.value).toEqual({ hostname: 'normalized', enabled: false })
  scope.stop()
})

it('keeps failed saves dirty and allows an explicit retry', async () => {
  const failure = new Error('Save failed')
  const saver = vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce({ hostname: 'edited', enabled: true })
  const { page, scope } = createPage({
    load: () => Promise.resolve({ hostname: 'router', enabled: true }),
    save: saver,
  })
  await page.load()
  page.data.value!.hostname = 'edited'
  await expect(page.save()).rejects.toBe(failure)
  expect(page.saveError.value).toBe(failure)
  expect(page.loadError.value).toBeUndefined()
  expect(page.refreshError.value).toBeUndefined()
  expect(page.dirty.value).toBe(true)
  expect(page.saving.value).toBe(false)
  const retry = page.save()
  expect(page.saveError.value).toBeUndefined()
  await retry
  expect(page.dirty.value).toBe(false)
  scope.stop()
})

it('invalidates an older refresh and blocks replacement while saving', async () => {
  const refresh = Promise.withResolvers<Settings>()
  const saved = Promise.withResolvers<Settings>()
  const loader = vi
    .fn()
    .mockResolvedValueOnce({ hostname: 'router', enabled: true })
    .mockReturnValueOnce(refresh.promise)
  const { page, scope } = createPage({ load: loader, save: () => saved.promise })
  await page.load()
  const reading = page.load()
  await Promise.resolve()
  const writing = page.save()
  await expect(page.load({ ifDirty: 'discard' })).resolves.toBe(false)
  expect(() => page.reset()).toThrow()
  expect(() => page.commit()).toThrow()
  page.cancelLoad()
  expect(page.saving.value).toBe(true)
  saved.resolve({ hostname: 'saved', enabled: true })
  await writing
  refresh.resolve({ hostname: 'stale', enabled: true })
  await expect(reading).resolves.toBe(false)
  expect(page.data.value?.hostname).toBe('saved')
  scope.stop()
})

it('invalidates pending discard confirmation when a save starts', async () => {
  const confirmation = Promise.withResolvers<boolean>()
  const loader = vi.fn(() => Promise.resolve({ hostname: 'router', enabled: true }))
  const { page, scope } = createPage({
    load: loader,
    save: value => Promise.resolve(value),
    confirmDiscard: () => confirmation.promise,
  })
  await page.load()
  page.data.value!.hostname = 'edited'
  const reading = page.load()
  await page.save()
  confirmation.resolve(true)
  await expect(reading).resolves.toBe(false)
  expect(loader).toHaveBeenCalledTimes(1)
  scope.stop()
})

it('does not discard edits made during an explicitly requested replacement load', async () => {
  const refresh = Promise.withResolvers<Settings>()
  const loader = vi
    .fn()
    .mockResolvedValueOnce({ hostname: 'router', enabled: true })
    .mockReturnValueOnce(refresh.promise)
  const { page, scope } = createPage({ load: loader })
  await page.load()
  const reading = page.load({ ifDirty: 'discard' })
  await Promise.resolve()
  page.data.value!.hostname = 'new edit'
  refresh.resolve({ hostname: 'server', enabled: true })
  await expect(reading).resolves.toBe(false)
  expect(page.data.value?.hostname).toBe('new edit')
  scope.stop()
})

it('ignores save completion after disposal and cannot restart', async () => {
  const saved = Promise.withResolvers<Settings>()
  const { page, scope } = createPage({
    load: () => Promise.resolve({ hostname: 'router', enabled: true }),
    save: () => saved.promise,
  })
  await page.load()
  const writing = page.save()
  await Promise.resolve()
  scope.stop()
  saved.resolve({ hostname: 'saved', enabled: true })
  await expect(writing).resolves.toBe(false)
  expect(page.data.value?.hostname).toBe('router')
  await expect(page.load()).resolves.toBe(false)
  await expect(page.save()).resolves.toBe(false)
})

it('recovers from synchronous saver failures without keeping a settled request', async () => {
  const failure = new Error('Synchronous failure')
  const saver = vi
    .fn<NonNullable<PageModelOptions<Settings>['save']>>()
    .mockImplementationOnce(() => {
      throw failure
    })
    .mockResolvedValueOnce({ hostname: 'saved', enabled: true })
  const { page, scope } = createPage({
    load: () => Promise.resolve({ hostname: 'router', enabled: true }),
    save: saver,
  })
  await page.load()
  await expect(page.save()).rejects.toBe(failure)
  expect(page.saving.value).toBe(false)
  await expect(page.save()).resolves.toBe(true)
  expect(saver).toHaveBeenCalledTimes(2)
  scope.stop()
})

it('preserves edits excluded from dirty tracking during a save', async () => {
  const saved = Promise.withResolvers<Settings>()
  const scope = effectScope()
  const page = scope.run(() =>
    usePageModel({
      load: () => Promise.resolve({ hostname: 'router', enabled: true }),
      save: () => saved.promise,
      changes: { project: (value: Settings) => value.hostname },
      immediate: false,
      navigation: false,
    })
  )!
  await page.load()
  const writing = page.save()
  page.data.value!.enabled = false
  saved.resolve({ hostname: 'router', enabled: true })
  await writing
  expect(page.data.value?.enabled).toBe(false)
  expect(page.dirty.value).toBe(false)
  scope.stop()
})

it('cancels a deferred load before the loader starts', async () => {
  const loader = vi.fn(() => Promise.resolve({ hostname: 'router', enabled: true }))
  const { page, scope } = createPage({ load: loader })
  const loading = page.load()
  page.cancelLoad()
  await expect(loading).resolves.toBe(false)
  expect(loader).not.toHaveBeenCalled()
  scope.stop()
})
