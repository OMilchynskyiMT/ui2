import { onScopeDispose, readonly, ref } from 'vue'

import { useEventListeners } from './useEventListeners'

export type PollingOptions = {
  interval: number
  immediate?: boolean
  pauseWhenHidden?: boolean
  onError?: (error: unknown) => void
}

export const usePolling = (handler: () => void | PromiseLike<unknown>, options: PollingOptions) => {
  if (options.interval <= 0) {
    throw new RangeError('Polling interval must be greater than zero')
  }

  const active = ref(false)
  const pending = ref(false)

  const shouldPauseWhenHidden = options.pauseWhenHidden !== false
  let timer: ReturnType<typeof setTimeout> | undefined
  let currentRun: Promise<void> | undefined

  const clearTimer = (): void => {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
  }

  const isVisible = (): boolean => {
    return !shouldPauseWhenHidden || globalThis.document?.visibilityState !== 'hidden'
  }

  const execute = async (): Promise<void> => {
    await handler()
  }

  const handleScheduledError = (error: unknown): void => {
    options.onError?.(error)
  }

  const schedule = (): void => {
    clearTimer()
    if (!active.value || !isVisible()) return

    timer = setTimeout(() => {
      timer = undefined
      void run().catch(handleScheduledError)
    }, options.interval)
  }

  const finishRun = async (run: Promise<void>): Promise<void> => {
    try {
      await run
    } finally {
      pending.value = false
      currentRun = undefined
      schedule()
    }
  }

  const run = (): Promise<void> => {
    clearTimer()
    if (currentRun) return currentRun

    pending.value = true
    currentRun = finishRun(execute())
    return currentRun
  }

  const start = (): void => {
    if (active.value) return
    active.value = true

    if (options.immediate === true && isVisible()) {
      void run().catch(handleScheduledError)
      return
    }

    schedule()
  }

  const stop = (): void => {
    active.value = false
    clearTimer()
  }

  const onVisibilityChange = (): void => {
    if (!active.value) return

    if (!isVisible()) {
      clearTimer()
      return
    }

    void run().catch(handleScheduledError)
  }

  const events = useEventListeners(() => {
    if (!shouldPauseWhenHidden) return []

    return [
      {
        // NOTE: document requires jsdom env, tests use node env
        // so this does not require jsdom in tests, works in browsers
        // and remains safe in Node/SSR/tests where DOM is absent
        target: typeof document === 'undefined' ? undefined : document,
        type: 'visibilitychange',
        listener: onVisibilityChange,
      },
    ]
  })

  events.start()
  onScopeDispose(stop)

  return {
    active: readonly(active),
    pending: readonly(pending),
    start,
    stop,
    run,
  }
}
