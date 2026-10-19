import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'

import { useAsyncAction } from '../useAsyncAction'

it('joins concurrent submissions and permits another after completion', async () => {
  const first = Promise.withResolvers<string>()
  const executor = vi
    .fn()
    .mockImplementationOnce(() => first.promise)
    .mockResolvedValue('second')
  const scope = effectScope()
  const action = scope.run(() => useAsyncAction(executor))
  if (!action) throw new Error('Unable to create async action')

  const pending = action.run()
  expect(action.run()).toBe(pending)
  expect(action.pending.value).toBe(true)
  await Promise.resolve()
  expect(executor).toHaveBeenCalledTimes(1)

  first.resolve('first')
  await expect(pending).resolves.toBe('first')
  expect(action.pending.value).toBe(false)
  await expect(action.run()).resolves.toBe('second')
  expect(executor).toHaveBeenCalledTimes(2)
  scope.stop()
})

it('reports a failed request and clears the error on retry', async () => {
  const failure = new Error('Rejected')
  const executor = vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce('ok')
  const scope = effectScope()
  const action = scope.run(() => useAsyncAction(executor))
  if (!action) throw new Error('Unable to create async action')

  await expect(action.run()).rejects.toBe(failure)
  expect(action.pending.value).toBe(false)
  expect(action.error.value).toBe(failure)

  await expect(action.run()).resolves.toBe('ok')
  expect(action.error.value).toBeUndefined()
  scope.stop()
})

it('passes action arguments and supports synchronous exceptions', async () => {
  const action = useAsyncAction((name: string) => {
    if (!name) throw new Error('Missing name')
    return Promise.resolve(name.toUpperCase())
  })
  await expect(action.run('')).rejects.toThrow('Missing name')
  await expect(action.run('device')).resolves.toBe('DEVICE')
})
