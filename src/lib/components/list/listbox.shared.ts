import { computed, type MaybeRefOrGetter, shallowRef, toValue } from 'vue'

import { findNextTypeaheadMatch } from '@/composables/useTypeahead'

import type { ListboxEntry, ListboxGroup, ListboxOption } from './listbox.types'

export const getListboxOptionId = (listboxId: string, index: number): string => `${listboxId}-option-${index}`

export const isListboxGroup = <V>(entry: ListboxEntry<V>): entry is ListboxGroup<V> => {
  return 'items' in entry
}

export const flattenListboxOptions = <V>(entries: readonly ListboxEntry<V>[]): ListboxOption<V>[] => {
  return entries.flatMap(entry => (isListboxGroup(entry) ? entry.items : [entry]))
}

export const getListboxOptionText = <V>(option: ListboxOption<V>): string => {
  return option.title ?? String(option.value)
}

export const useListboxNavigation = <V extends string | number>(
  entries: MaybeRefOrGetter<readonly ListboxEntry<V>[]>,
  selectedValue: MaybeRefOrGetter<V | null | undefined>
) => {
  const activeValue = shallowRef<V>()

  const options = computed(() => flattenListboxOptions(toValue(entries)))
  const enabledOptions = computed(() => options.value.filter(option => !option.disabled))
  const activeOption = computed(() => {
    return options.value.find(option => option.value === activeValue.value && !option.disabled)
  })
  const selectedOption = computed(() => {
    return options.value.find(option => option.value === toValue(selectedValue))
  })

  const syncActiveValue = (): void => {
    const enabled = enabledOptions.value

    if (enabled.length === 0) {
      activeValue.value = undefined
      return
    }

    const selected = enabled.find(option => option.value === toValue(selectedValue))
    activeValue.value = selected?.value ?? enabled[0]?.value
  }

  const moveActiveValue = (delta: -1 | 1): void => {
    const enabled = enabledOptions.value
    if (enabled.length === 0) return

    const currentIndex = enabled.findIndex(option => option.value === activeValue.value)
    const nextIndex =
      currentIndex === -1
        ? delta > 0
          ? 0
          : enabled.length - 1
        : (currentIndex + delta + enabled.length) % enabled.length

    activeValue.value = enabled[nextIndex]?.value
  }

  const moveActiveTo = (edge: 'first' | 'last'): void => {
    activeValue.value = edge === 'first' ? enabledOptions.value[0]?.value : enabledOptions.value.at(-1)?.value
  }

  const getActiveOptionId = (listboxId: string): string | undefined => {
    const index = options.value.findIndex(option => option.value === activeValue.value)
    return index === -1 ? undefined : getListboxOptionId(listboxId, index)
  }

  return {
    activeValue,
    options,
    enabledOptions,
    activeOption,
    selectedOption,
    syncActiveValue,
    moveActiveValue,
    moveActiveTo,
    getActiveOptionId,
  }
}

export const findNextListboxOption = <V>(
  options: readonly ListboxOption<V>[],
  activeValue: V | undefined,
  query: string
): ListboxOption<V> | undefined => {
  const activeIndex = options.findIndex(option => option.value === activeValue)
  return findNextTypeaheadMatch(options, activeIndex, query, getListboxOptionText)
}
