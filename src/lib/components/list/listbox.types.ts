export type ListboxOption<V> = {
  value: V
  title?: string
  disabled?: boolean
}

export type ListboxGroup<V> = {
  type: 'group'
  title: string
  items: readonly ListboxOption<V>[]
}

export type ListboxEntry<V> = ListboxOption<V> | ListboxGroup<V>
