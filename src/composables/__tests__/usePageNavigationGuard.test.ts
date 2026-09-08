import { effectScope, ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'

const routerGuards = vi.hoisted(() => ({
  leave: undefined as undefined | (() => unknown),
  update: undefined as undefined | (() => unknown),
}))

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: (guard: () => unknown) => {
    routerGuards.leave = guard
  },
  onBeforeRouteUpdate: (guard: () => unknown) => {
    routerGuards.update = guard
  },
}))

import { usePageNavigationGuard } from '../usePageNavigationGuard'

beforeEach(() => {
  routerGuards.leave = undefined
  routerGuards.update = undefined
})

it('registers route guards and leaves immediately when data is clean', async () => {
  const dirty = ref(false)
  const confirm = vi.fn(() => false)
  const scope = effectScope()
  const guard = scope.run(() => usePageNavigationGuard(dirty, { confirm, browserUnload: false }))

  if (!guard) throw new Error('Unable to create navigation guard')

  expect(routerGuards.leave).toBeTypeOf('function')
  expect(routerGuards.update).toBeTypeOf('function')
  await expect(guard.canLeave()).resolves.toBe(true)
  expect(confirm).not.toHaveBeenCalled()

  scope.stop()
})

it('uses one confirmation for concurrent leave checks', async () => {
  const dirty = ref(true)
  const deferred = Promise.withResolvers<boolean>()
  const confirm = vi.fn(() => deferred.promise)
  const scope = effectScope()
  const guard = scope.run(() => usePageNavigationGuard(dirty, { confirm, browserUnload: false }))

  if (!guard) throw new Error('Unable to create navigation guard')

  const first = guard.canLeave()
  const second = guard.canLeave()

  expect(confirm).toHaveBeenCalledTimes(1)
  deferred.resolve(true)

  await expect(first).resolves.toBe(true)
  await expect(second).resolves.toBe(true)

  scope.stop()
})

it('allows navigation if the page becomes clean while confirmation is open', async () => {
  const dirty = ref(true)
  const deferred = Promise.withResolvers<boolean>()
  const scope = effectScope()
  const guard = scope.run(() =>
    usePageNavigationGuard(dirty, {
      confirm: () => deferred.promise,
      browserUnload: false,
      routeUpdates: false,
    })
  )

  if (!guard) throw new Error('Unable to create navigation guard')

  expect(routerGuards.update).toBeUndefined()

  const result = guard.canLeave()
  dirty.value = false
  deferred.resolve(false)

  await expect(result).resolves.toBe(true)
  scope.stop()
})
