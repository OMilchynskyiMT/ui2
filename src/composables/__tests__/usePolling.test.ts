import { effectScope } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'

import { usePolling } from '../usePolling'

const createPolling = (handler: Parameters<typeof usePolling>[0], options?: Parameters<typeof usePolling>[1]) => {
  const scope = effectScope()
  const polling = scope.run(() => usePolling(handler, options ?? { interval: 1000 }))

  if (!polling) {
    throw new Error('Unable to create polling composable')
  }

  return {
    scope,
    polling,
  }
}

afterEach(() => {
  vi.useRealTimers()
})

it('does not overlap scheduled runs', async () => {
  vi.useFakeTimers()

  const deferred = Promise.withResolvers<void>()
  const handler = vi.fn(() => deferred.promise)
  const { scope, polling } = createPolling(handler)

  polling.start()
  await vi.advanceTimersByTimeAsync(1000)

  expect(handler).toHaveBeenCalledTimes(1)
  expect(polling.pending.value).toBe(true)

  await vi.advanceTimersByTimeAsync(3000)
  expect(handler).toHaveBeenCalledTimes(1)

  deferred.resolve()
  await vi.advanceTimersByTimeAsync(1000)

  expect(handler).toHaveBeenCalledTimes(2)
  scope.stop()
})

it('reports scheduled errors and keeps polling', async () => {
  vi.useFakeTimers()

  const failure = new Error('Polling failed')
  const handler = vi.fn().mockRejectedValueOnce(failure).mockResolvedValue(undefined)
  const onError = vi.fn()
  const { scope, polling } = createPolling(handler, { interval: 1000, onError })

  polling.start()
  await vi.advanceTimersByTimeAsync(1000)

  expect(onError).toHaveBeenCalledWith(failure)

  await vi.advanceTimersByTimeAsync(1000)

  expect(handler).toHaveBeenCalledTimes(2)
  expect(onError).toHaveBeenCalledTimes(1)

  scope.stop()
})

it('runs immediately when configured', () => {
  vi.useFakeTimers()

  const handler = vi.fn()
  const scope = effectScope()
  const polling = scope.run(() => usePolling(handler, { interval: 1000, immediate: true }))

  if (!polling) {
    throw new Error('Unable to create polling composable')
  }

  polling.start()
  expect(handler).toHaveBeenCalledTimes(1)
  scope.stop()
})
