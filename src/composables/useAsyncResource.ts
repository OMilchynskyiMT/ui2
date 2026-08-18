import { computed, onScopeDispose, readonly, ref, shallowReadonly, shallowRef } from 'vue'

export type AsyncResourceContext = {
  signal: AbortSignal
}

export type AsyncResourceLoader<T> = (context: AsyncResourceContext) => Promise<T>

/**
 * Manages the lifecycle of an asynchronous resource.
 *
 * @example
 * const users = useAsyncResource(
 *   ({ signal }) => getUsers({ signal })
 * )
 *
 * await users.load()
 *
 * users.data.value
 * users.loading.value
 * users.refreshing.value
 * users.error.value
 */
export function useAsyncResource<T>(loader: AsyncResourceLoader<T>) {
  const data = shallowRef<T>()
  const error = shallowRef<unknown>()

  const pending = ref(false)
  const ready = ref(false)

  let requestId = 0
  let controller: AbortController | undefined

  const loading = computed(() => pending.value && !ready.value)
  const refreshing = computed(() => pending.value && ready.value)

  const load = async (): Promise<T | undefined> => {
    const currentRequestId = ++requestId
    controller?.abort()
    const currentController = new AbortController()
    controller = currentController
    pending.value = true
    error.value = undefined

    try {
      const result = await loader({
        signal: currentController.signal,
      })

      if (currentRequestId !== requestId || currentController.signal.aborted) {
        return
      }

      data.value = result
      ready.value = true

      return result
    } catch (error_) {
      if (currentRequestId !== requestId || currentController.signal.aborted) {
        return
      }

      error.value = error_
      throw error_
    } finally {
      if (currentRequestId === requestId) {
        pending.value = false

        if (controller === currentController) {
          controller = undefined
        }
      }
    }
  }

  const cancel = (): void => {
    ++requestId
    controller?.abort()
    controller = undefined
    pending.value = false
  }

  const replace = (value: T): void => {
    cancel()
    data.value = value
    error.value = undefined
    ready.value = true
  }

  onScopeDispose(cancel)

  return {
    data: shallowReadonly(data),
    error: readonly(error),
    pending: readonly(pending),
    ready: readonly(ready),

    loading,
    refreshing,

    load,
    replace,
    cancel,
  }
}
