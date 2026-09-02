import { type MaybeRefOrGetter, onScopeDispose, toValue, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

type Awaitable<T> = T | Promise<T>

export type PageNavigationGuardOptions = {
  confirm: () => Awaitable<boolean>

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
  let isBeforeUnloadAttached = false

  const canLeave = async (): Promise<boolean> => {
    if (!toValue(dirty)) return true
    if (confirmation) return confirmation
    confirmation = Promise.resolve(options.confirm())

    try {
      const isConfirmed = await confirmation
      return isConfirmed || !toValue(dirty)
    } finally {
      confirmation = undefined
    }
  }

  const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
    if (!toValue(dirty)) return
    event.preventDefault()
    // NOTE: for legacy support, e.g. Chrome/Edge < 119
    event.returnValue = true
  }

  const setBeforeUnload = (isEnabled: boolean): void => {
    if (typeof window === 'undefined') return
    if (isEnabled === isBeforeUnloadAttached) return

    if (isEnabled) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }

    isBeforeUnloadAttached = isEnabled
  }

  onBeforeRouteLeave(() => canLeave())

  if (options.routeUpdates !== false) {
    onBeforeRouteUpdate(() => canLeave())
  }

  if (options.browserUnload !== false) {
    watch(
      () => toValue(dirty),
      value => setBeforeUnload(value),
      {
        immediate: true,
      }
    )
  }

  onScopeDispose(() => setBeforeUnload(false))

  return {
    canLeave,
  }
}
