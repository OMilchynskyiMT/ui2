import { computed, type MaybeRefOrGetter, shallowRef, toValue } from 'vue'

import { flattenListItems, getListboxOptionId } from '../list/listbox.shared'
import type { ListItem, ListOption } from '../list/listbox.types'

export const useSelectionNavigation = <V extends string | number>(
  options: MaybeRefOrGetter<readonly ListOption<V>[]>,
  selectedValue: MaybeRefOrGetter<V | null | undefined>
) => {
  const activeValue = shallowRef<V>()

  const items = computed(() => flattenListItems(toValue(options)))
  const enabledItems = computed(() => items.value.filter(item => !item.disabled))
  const activeItem = computed(() => {
    return items.value.find(item => item.value === activeValue.value && !item.disabled)
  })
  const selectedItem = computed(() => {
    return items.value.find(item => item.value === toValue(selectedValue))
  })

  const syncActiveValue = (): void => {
    const enabled = enabledItems.value

    if (enabled.length === 0) {
      activeValue.value = undefined
      return
    }

    const selected = enabled.find(item => item.value === toValue(selectedValue))
    activeValue.value = selected?.value ?? enabled[0]?.value
  }

  const moveActiveValue = (delta: -1 | 1): void => {
    const enabled = enabledItems.value
    if (enabled.length === 0) return

    const currentIndex = enabled.findIndex(item => item.value === activeValue.value)
    const nextIndex =
      currentIndex === -1
        ? delta > 0
          ? 0
          : enabled.length - 1
        : (currentIndex + delta + enabled.length) % enabled.length

    activeValue.value = enabled[nextIndex]?.value
  }

  const moveActiveTo = (edge: 'first' | 'last'): void => {
    activeValue.value = edge === 'first' ? enabledItems.value[0]?.value : enabledItems.value.at(-1)?.value
  }

  const getActiveOptionId = (listboxId: string): string | undefined => {
    const index = items.value.findIndex(item => item.value === activeValue.value)
    return index === -1 ? undefined : getListboxOptionId(listboxId, index)
  }

  return {
    activeValue,
    items,
    enabledItems,
    activeItem,
    selectedItem,
    syncActiveValue,
    moveActiveValue,
    moveActiveTo,
    getActiveOptionId,
  }
}

export const findNextTypeaheadItem = <V>(
  items: readonly ListItem<V>[],
  activeValue: V | undefined,
  query: string,
  getText: (item: ListItem<V>) => string
): ListItem<V> | undefined => {
  const normalizedQuery = query.toLowerCase()
  const activeIndex = items.findIndex(item => item.value === activeValue)
  const orderedItems =
    activeIndex === -1 ? items : [...items.slice(activeIndex + 1), ...items.slice(0, activeIndex + 1)]

  return orderedItems.find(item => getText(item).toLowerCase().startsWith(normalizedQuery))
}
