import {
  getCurrentScope,
  type MaybeRefOrGetter,
  onScopeDispose,
  readonly,
  type Ref,
  shallowRef,
  toValue,
  watch,
} from 'vue'

// a read-only, trailing-edge snapshot of a reactive source
export const useDebouncedReference = <T>(source: Ref<T>, delay: MaybeRefOrGetter<number>): Readonly<Ref<T>> => {
  const value = shallowRef(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined

  const cancel = (): void => {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
  }

  const schedule = (): void => {
    cancel()
    const milliseconds = toValue(delay)
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      throw new RangeError('Debounce delay must be a finite, non-negative number')
    }
    if (milliseconds === 0) {
      value.value = source.value
      return
    }
    timer = setTimeout(() => {
      timer = undefined
      value.value = source.value
    }, milliseconds)
  }

  watch(source, schedule, { flush: 'sync' })
  watch(
    () => toValue(delay),
    () => {
      if (timer !== undefined) schedule()
    },
    { flush: 'sync' }
  )
  if (getCurrentScope()) onScopeDispose(cancel)

  return readonly(value) as Readonly<Ref<T>>
}

export type DebouncedFunction<T extends (...parameters: never[]) => void> = {
  (...parameters: Parameters<T>): void
  cancel: () => void
  flush: () => void
  pending: () => boolean
}

// debounce a synchronous callback on the trailing edge
export const useDebouncedFunction = <T extends (...parameters: never[]) => void>(
  callback: T,
  delay: MaybeRefOrGetter<number>
): DebouncedFunction<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined
  let latestArguments: Parameters<T> | undefined

  const clearTimer = (): void => {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
  }

  const cancel = (): void => {
    clearTimer()
    latestArguments = undefined
  }

  const flush = (): void => {
    if (latestArguments === undefined) return
    const arguments_ = latestArguments
    cancel()
    callback(...arguments_)
  }

  const schedule = (): void => {
    clearTimer()
    const milliseconds = toValue(delay)
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      cancel()
      throw new RangeError('Debounce delay must be a finite, non-negative number')
    }
    if (milliseconds === 0) {
      flush()
      return
    }
    timer = setTimeout(flush, milliseconds)
  }

  const debounced = ((...parameters: Parameters<T>): void => {
    latestArguments = parameters
    schedule()
  }) as DebouncedFunction<T>

  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = () => latestArguments !== undefined

  if (getCurrentScope()) {
    watch(
      () => toValue(delay),
      () => {
        if (latestArguments !== undefined) schedule()
      },
      { flush: 'sync' }
    )
    onScopeDispose(cancel)
  }

  return debounced
}
