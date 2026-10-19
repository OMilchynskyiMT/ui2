import { readonly, ref, shallowReadonly, shallowRef } from 'vue'

/**
 * Executes a standalone asynchronous action with reactive pending and error
 * states, preventing concurrent executions.
 * Calls to `run()` while an action is pending return the same promise without
 * invoking the action again. Arguments from subsequent calls are ignored.
 * Each new exeution clears the previous error. Failures are stored in `error`
 * and re-thrown to the caller. The pending state resets when execution settles.
 *
 * WARN: tracks only the request lifecycle, not the completion of any device-side
 * operation it may trigger. Cancellation and operation-specific progress
 * remain the caller's responsibility.
 *
 * @example
 * ```ts
 * const restart = useAsyncAction(() => http.post('/api/command/restart'))
 *
 * try {
 *   await restart.run()
 *   // request completed, device may still be restarting
 * } catch {
 *   // the failure is also available in restart.error.value
 * }
 *
 * // restart.pending.value can be used to disable the action button
 * ```
 */
export const useAsyncAction = <P extends unknown[], R>(action: (...parameters: P) => Promise<R>) => {
  const pending = ref(false)
  const error = shallowRef<unknown>()
  let current: Promise<R> | undefined

  const run = (...parameters: P): Promise<R> => {
    if (current) return current

    pending.value = true
    error.value = undefined

    const execute = async (): Promise<R> => {
      await Promise.resolve()

      try {
        return await action(...parameters)
      } catch (thrownError) {
        error.value = thrownError
        throw thrownError
      } finally {
        current = undefined
        pending.value = false
      }
    }

    const request = execute()
    current = request
    return request
  }

  return { pending: readonly(pending), error: shallowReadonly(error), run }
}
