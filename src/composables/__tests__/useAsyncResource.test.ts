import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'

import { type AsyncResourceLoader, useAsyncResource } from '../useAsyncResource'

const createResource = <T>(loader: AsyncResourceLoader<T>) => {
  const scope = effectScope()
  const resource = scope.run(() => useAsyncResource(loader))

  if (!resource) throw new Error('Unable to create async resource')

  return { resource, scope }
}

it('exposes loading and ready state around a successful load', async () => {
  const deferred = Promise.withResolvers<{ hostname: string }>()
  const loader = vi.fn(() => deferred.promise)
  const { resource, scope } = createResource(loader)

  const loading = resource.load()

  expect(resource.pending.value).toBe(true)
  expect(resource.loading.value).toBe(true)
  expect(resource.refreshing.value).toBe(false)
  expect(resource.ready.value).toBe(false)

  deferred.resolve({ hostname: 'router' })
  await expect(loading).resolves.toEqual({ hostname: 'router' })

  expect(resource.data.value).toEqual({ hostname: 'router' })
  expect(resource.error.value).toBeUndefined()
  expect(resource.pending.value).toBe(false)
  expect(resource.ready.value).toBe(true)

  scope.stop()
})

it('publishes a load error and rethrows it', async () => {
  const failure = new Error('Unable to load')
  const { resource, scope } = createResource(() => {
    throw failure
  })

  await expect(resource.load()).rejects.toBe(failure)

  expect(resource.error.value).toBe(failure)
  expect(resource.pending.value).toBe(false)
  expect(resource.ready.value).toBe(false)

  scope.stop()
})

it('aborts and ignores a superseded request', async () => {
  const first = Promise.withResolvers<string>()
  const second = Promise.withResolvers<string>()
  const signals: AbortSignal[] = []
  let call = 0
  const { resource, scope } = createResource<string>(({ signal }) => {
    signals.push(signal)
    call += 1
    return call === 1 ? first.promise : second.promise
  })

  const firstLoad = resource.load()
  const secondLoad = resource.load()

  expect(signals[0]?.aborted).toBe(true)
  expect(signals[1]?.aborted).toBe(false)

  first.resolve('stale')
  second.resolve('current')

  await expect(firstLoad).resolves.toBeUndefined()
  await expect(secondLoad).resolves.toBe('current')
  expect(resource.data.value).toBe('current')

  scope.stop()
})

it('cancels an active request without publishing its eventual result', async () => {
  const deferred = Promise.withResolvers<string>()
  let signal: AbortSignal | undefined
  const { resource, scope } = createResource<string>(context => {
    signal = context.signal
    return deferred.promise
  })

  const loading = resource.load()
  resource.cancel()

  expect(signal?.aborted).toBe(true)
  expect(resource.pending.value).toBe(false)

  deferred.resolve('late')
  await expect(loading).resolves.toBeUndefined()
  expect(resource.data.value).toBeUndefined()
  expect(resource.ready.value).toBe(false)

  scope.stop()
})

it('replace cancels the active request and establishes a ready value', async () => {
  const deferred = Promise.withResolvers<string>()
  let signal: AbortSignal | undefined
  const { resource, scope } = createResource<string>(context => {
    signal = context.signal
    return deferred.promise
  })

  const loading = resource.load()
  resource.replace('local')

  expect(signal?.aborted).toBe(true)
  expect(resource.data.value).toBe('local')
  expect(resource.ready.value).toBe(true)
  expect(resource.error.value).toBeUndefined()

  deferred.resolve('stale')
  await expect(loading).resolves.toBeUndefined()
  expect(resource.data.value).toBe('local')

  scope.stop()
})
