import { onScopeDispose } from 'vue'

export type TemporalEvent = {
  target: EventTarget | null | undefined
  type: string
  listener: EventListenerOrEventListenerObject
  options?: AddEventListenerOptions | boolean
}

export const useEventListeners = (factory: () => TemporalEvent[]) => {
  let cleanups: (() => void)[] = []

  const stop = (): void => {
    for (const cleanup of cleanups) {
      cleanup()
    }

    cleanups = []
  }

  const start = (): void => {
    stop()

    for (const event of factory()) {
      if (!event.target) continue

      event.target.addEventListener(event.type, event.listener, event.options)
      cleanups.push(() => {
        event.target?.removeEventListener(event.type, event.listener, event.options)
      })
    }
  }

  onScopeDispose(stop)

  return {
    start,
    stop,
  }
}
