import { ref } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  findNextListboxOption,
  flattenListboxOptions,
  getListboxOptionText,
  useListboxNavigation,
} from '../listbox.shared'
import type { ListboxEntry } from '../listbox.types'

const entries: readonly ListboxEntry<string>[] = [
  { value: 'alpha', title: 'Alpha' },
  {
    type: 'group',
    title: 'Grouped',
    items: [
      { value: 'bravo', title: 'Bravo' },
      { value: 'charlie', title: 'Charlie', disabled: true },
    ],
  },
  { value: 'delta', title: 'Delta' },
]

describe('listbox helpers', () => {
  it('flattens grouped options without changing their order', () => {
    expect(flattenListboxOptions(entries).map(option => option.value)).toEqual(['alpha', 'bravo', 'charlie', 'delta'])
  })

  it('uses the title as option text when it is present', () => {
    expect(getListboxOptionText({ value: 'value', title: 'Visible title' })).toBe('Visible title')
    expect(getListboxOptionText({ value: 'value' })).toBe('value')
  })

  it('finds typeahead options after the active option and wraps', () => {
    const options = flattenListboxOptions(entries).filter(option => !option.disabled)

    expect(findNextListboxOption(options, 'alpha', 'd')?.value).toBe('delta')
    expect(findNextListboxOption(options, 'delta', 'a')?.value).toBe('alpha')
  })
})

describe('useListboxNavigation', () => {
  it('synchronizes focus with selection and skips disabled options', () => {
    const selected = ref<string | null>('bravo')
    const navigation = useListboxNavigation(entries, selected)

    navigation.syncActiveValue()
    expect(navigation.activeValue.value).toBe('bravo')

    navigation.moveActiveValue(1)
    expect(navigation.activeValue.value).toBe('delta')

    navigation.moveActiveValue(1)
    expect(navigation.activeValue.value).toBe('alpha')

    navigation.moveActiveTo('last')
    expect(navigation.activeValue.value).toBe('delta')
  })

  it('falls back to the first enabled option when selection is unavailable', () => {
    const selected = ref<string | null>('missing')
    const navigation = useListboxNavigation(entries, selected)

    navigation.syncActiveValue()
    expect(navigation.activeValue.value).toBe('alpha')
  })
})
