import { type MaybeRefOrGetter, toValue, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

import { useEventListeners } from '@/lib/composables/useEventListeners'

type Awaitable<T> = T | Promise<T>

export type PageNavigationGuardOptions = {
  confirm: () => Awaitable<boolean>

  // hard block route navigation during a write, including after a pending confirmation
  blocked?: MaybeRefOrGetter<boolean>
  routeUpdates?: boolean
  browserUnload?: boolean
}

/**
 * Prevents navigation while the current model contains unsaved changes
 * Usually composed through usePageModel()
 *
 * @example
 * usePageNavigationGuard(dirty, {
 *   confirm: () => confirmUnsavedChanges(),
 * })
 */
export const usePageNavigationGuard = (dirty: MaybeRefOrGetter<boolean>, options: PageNavigationGuardOptions) => {
  let confirmation: Promise<boolean> | undefined

  const canLeave = async (): Promise<boolean> => {
    if (toValue(options.blocked)) return false
    if (!toValue(dirty)) return true
    if (confirmation) return confirmation
    const canConfirmLeave = async (): Promise<boolean> => {
      await Promise.resolve()
      try {
        if (toValue(options.blocked)) return false
        const isConfirmed = await options.confirm()
        return !toValue(options.blocked) && (isConfirmed || !toValue(dirty))
      } finally {
        confirmation = undefined
      }
    }
    confirmation = canConfirmLeave()
    return confirmation
  }

  const handleBeforeUnload = (event: Event): void => {
    if (!toValue(dirty) && !toValue(options.blocked)) return

    const beforeUnloadEvent = event
    beforeUnloadEvent.preventDefault()
    // NOTE: for legacy support, e.g. Chrome/Edge < 119
    beforeUnloadEvent.returnValue = true
  }

  const beforeUnload = useEventListeners(() => [
    {
      target: typeof globalThis === 'undefined' ? undefined : globalThis,
      type: 'beforeunload',
      listener: handleBeforeUnload,
    },
  ])

  onBeforeRouteLeave(() => canLeave())

  if (options.routeUpdates !== false) {
    onBeforeRouteUpdate(() => canLeave())
  }

  if (options.browserUnload !== false) {
    watch(
      () => toValue(dirty) || !!toValue(options.blocked),
      enabled => (enabled ? beforeUnload.start() : beforeUnload.stop()),
      {
        immediate: true,
        flush: 'sync',
      }
    )
  }

  return {
    canLeave,
  }
}
