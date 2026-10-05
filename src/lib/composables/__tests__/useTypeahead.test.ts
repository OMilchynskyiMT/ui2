import { effectScope } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'

import { findNextTypeaheadMatch, isTypeaheadKey, useTypeahead } from '../useTypeahead'

afterEach(() => {
  vi.useRealTimers()
})

it('finds the next matching item and wraps after the active item', () => {
  const items = ['Alpha', 'Bravo', 'Alpine']

  expect(findNextTypeaheadMatch(items, 0, 'a', item => item)).toBe('Alpine')
  expect(findNextTypeaheadMatch(items, 2, 'a', item => item)).toBe('Alpha')
})

const event = (key: string, modifiers: Partial<KeyboardEvent> = {}) =>
  ({ key, altKey: false, ctrlKey: false, metaKey: false, ...modifiers }) as KeyboardEvent

it('accepts printable keys without command modifiers', () => {
  expect(isTypeaheadKey(event('a'))).toBe(true)
  expect(isTypeaheadKey(event('ArrowDown'))).toBe(false)
  expect(isTypeaheadKey(event('a', { ctrlKey: true }))).toBe(false)
})

it('cycles repeated keys and clears the query after the timeout', async () => {
  vi.useFakeTimers()

  const matches: string[] = []
  const items = ['Alpha', 'Alpine', 'Bravo']
  let activeIndex = -1
  const scope = effectScope()
  const typeahead = scope.run(() =>
    useTypeahead({
      items: () => items,
      activeIndex: () => activeIndex,
      getText: item => item,
      onMatch: item => {
        matches.push(item)
        activeIndex = items.indexOf(item)
      },
      timeout: 100,
    })
  )

  if (!typeahead) throw new Error('Unable to create typeahead composable')

  typeahead.apply('a')
  typeahead.apply('a')
  expect(matches).toEqual(['Alpha', 'Alpine'])

  await vi.advanceTimersByTimeAsync(100)
  typeahead.apply('b')
  expect(matches.at(-1)).toBe('Bravo')

  scope.stop()
})
