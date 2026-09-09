import { onScopeDispose } from 'vue'

export const TYPEAHEAD_RESET_TIMEOUT = 700

export const isTypeaheadKey = (event: KeyboardEvent): boolean => {
  return event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey
}

export const findNextTypeaheadMatch = <T>(
  items: readonly T[],
  activeIndex: number,
  query: string,
  getText: (item: T) => string
): T | undefined => {
  if (items.length === 0) return undefined

  const normalizedQuery = query.toLocaleLowerCase()
  const orderedItems =
    activeIndex < 0
      ? items
      : [...items.slice(activeIndex + 1), ...items.slice(0, activeIndex + 1)]

  return orderedItems.find(item => getText(item).toLocaleLowerCase().startsWith(normalizedQuery))
}

export type TypeaheadOptions<T> = {
  items: () => readonly T[]
  activeIndex: () => number
  getText: (item: T) => string
  onMatch: (item: T) => void
  timeout?: number
}

export const useTypeahead = <T>(options: TypeaheadOptions<T>) => {
  let query = ''
  let timer: ReturnType<typeof globalThis.setTimeout> | undefined

  const clear = (): void => {
    query = ''
    if (timer === undefined) return

    clearTimeout(timer)
    timer = undefined
  }

  const apply = (key: string): void => {
    if (timer !== undefined) clearTimeout(timer)

    const normalizedKey = key.toLocaleLowerCase()
    const isRepeatedKey = query.length > 0 && [...query].every(character => character === normalizedKey)
    query = isRepeatedKey ? normalizedKey : `${query}${normalizedKey}`

    const match = findNextTypeaheadMatch(options.items(), options.activeIndex(), query, options.getText)
    if (match !== undefined) options.onMatch(match)

    timer = setTimeout(clear, options.timeout ?? TYPEAHEAD_RESET_TIMEOUT)
  }

  onScopeDispose(clear)

  return {
    apply,
    clear,
  }
}
