export type ListItem<V> = {
  value: V
  title?: string
  disabled?: boolean
}

export type ListGroup<V> = {
  type: 'group'
  title: string
  items: ListItem<V>[]
}

export type ListOption<V> = ListItem<V> | ListGroup<V>
