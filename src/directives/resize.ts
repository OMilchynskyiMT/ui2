import type { Directive } from 'vue'

export type ResizeHandler = (entry: ResizeObserverEntry) => void

export type ResizeOptions = {
  handler: ResizeHandler
  box?: ResizeObserverBoxOptions
}

export type ResizeDirectiveValue = ResizeHandler | ResizeOptions

const normalizeValue = (value: ResizeDirectiveValue): ResizeOptions => {
  return typeof value === 'function' ? { handler: value } : value
}

export const createResizeDirective = (): Directive<Element, ResizeDirectiveValue> => {
  const values = new WeakMap<Element, ResizeOptions>()
  let observer: ResizeObserver | undefined
  let observedElements = 0

  const getObserver = (): ResizeObserver | undefined => {
    if (observer) return observer
    if (typeof ResizeObserver === 'undefined') return undefined

    observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        values.get(entry.target)?.handler(entry)
      }
    })

    return observer
  }

  const startObserving = (resizeObserver: ResizeObserver, element: Element, box?: ResizeObserverBoxOptions): void => {
    if (!box) {
      resizeObserver.observe(element)
      return
    }

    try {
      resizeObserver.observe(element, { box })
    } catch {
      resizeObserver.observe(element)
    }
  }

  return {
    mounted(element, binding) {
      const value = normalizeValue(binding.value)
      values.set(element, value)

      const resizeObserver = getObserver()
      if (!resizeObserver) return

      startObserving(resizeObserver, element, value.box)
      observedElements += 1
    },

    updated(element, binding) {
      const previous = values.get(element)
      const value = normalizeValue(binding.value)
      values.set(element, value)

      if (previous?.box === value.box) return
      if (!observer) return

      observer.unobserve(element)
      startObserving(observer, element, value.box)
    },

    unmounted(element) {
      if (!values.has(element)) return

      values.delete(element)
      if (!observer) return

      observer.unobserve(element)
      observedElements -= 1

      if (observedElements !== 0) return

      observer.disconnect()
      observer = undefined
    },
  }
}
