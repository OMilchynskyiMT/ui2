import type { ListGroup, ListItem, ListOption } from './listbox.types'

export const getListboxOptionId = (listboxId: string, index: number): string => `${listboxId}-option-${index}`

export const isListGroup = <V>(option: ListOption<V>): option is ListGroup<V> => {
  return 'items' in option
}

export const flattenListItems = <V>(options: readonly ListOption<V>[]): ListItem<V>[] => {
  return options.flatMap(option => (isListGroup(option) ? option.items : [option]))
}

export const getListItemText = <V>(item: ListItem<V>): string => {
  return item.title ?? String(item.value)
}
