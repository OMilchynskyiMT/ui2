import { effectScope, ref } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'

import { useDebouncedFunction, useDebouncedReference } from '../useDebounced'

afterEach(() => {
  vi.useRealTimers()
})

it('keeps the source immediate and debounces the derived value', () => {
  vi.useFakeTimers()
  const scope = effectScope()
  const source = ref('')
  const delayed = scope.run(() => useDebouncedReference(source, 100))!
  source.value = 'a'
  vi.advanceTimersByTime(60)
  source.value = 'ab'
  expect(source.value).toBe('ab')
  expect(delayed.value).toBe('')
  vi.advanceTimersByTime(99)
  expect(delayed.value).toBe('')
  vi.advanceTimersByTime(1)
  expect(delayed.value).toBe('ab')
  scope.stop()
})

it('reschedules a pending value when delay changes and cleans up on disposal', () => {
  vi.useFakeTimers()
  const scope = effectScope()
  const source = ref(0)
  const delay = ref(100)
  const delayed = scope.run(() => useDebouncedReference(source, delay))!
  source.value = 1
  vi.advanceTimersByTime(50)
  delay.value = 20
  vi.advanceTimersByTime(20)
  expect(delayed.value).toBe(1)
  source.value = 2
  scope.stop()
  vi.runAllTimers()
  expect(delayed.value).toBe(1)
})

it('supports zero delay', () => {
  const source = ref(1)
  const scope = effectScope()
  const delayed = scope.run(() => useDebouncedReference(source, 0))!
  source.value = 2
  expect(delayed.value).toBe(2)
  scope.stop()
})

it('uses the latest invocation, then supports flush and cancel', () => {
  vi.useFakeTimers()
  const calls: string[] = []
  const scope = effectScope()
  const run = scope.run(() =>
    useDebouncedFunction((value: string) => {
      calls.push(value)
    }, 100)
  )!
  run('first')
  vi.advanceTimersByTime(80)
  run('second')
  expect(run.pending()).toBe(true)
  vi.advanceTimersByTime(99)
  expect(calls).toEqual([])
  run.flush()
  expect(calls).toEqual(['second'])
  expect(run.pending()).toBe(false)
  run('discard')
  run.cancel()
  vi.runAllTimers()
  expect(calls).toEqual(['second'])
  scope.stop()
})

it('re-schedules function calls on reactive delay changes and cancels on disposal', () => {
  vi.useFakeTimers()
  const calls = vi.fn()
  const delay = ref(100)
  const scope = effectScope()
  const run = scope.run(() => useDebouncedFunction(calls, delay))!
  run()
  delay.value = 10
  vi.advanceTimersByTime(10)
  expect(calls).toHaveBeenCalledOnce()
  run()
  scope.stop()
  vi.runAllTimers()
  expect(calls).toHaveBeenCalledOnce()
})
