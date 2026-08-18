import { computed, reactive, shallowReadonly, shallowRef, toRaw } from 'vue'

import { type AsyncResourceLoader, useAsyncResource } from './useAsyncResource'
import { type ChangeTrackerOptions, useChangeTracker } from './useChangeTracker'
import { type PageNavigationGuardOptions, usePageNavigationGuard } from './usePageNavigationGuard'

type Awaitable<T> = T | Promise<T>

export type PageLoadOptions = {
  discardChanges?: boolean
}

export type PageNavigationOptions = Omit<PageNavigationGuardOptions, 'confirm'>

export type PageModelOptions<T extends object, TTracked = T> = {
  load: AsyncResourceLoader<T>
  // Overrides the default structured-clone behavior
  clone?: (value: T) => T
  // Configures which model state participates in dirty tracking
  changes?: ChangeTrackerOptions<T, TTracked>
  // Confirms whether unsaved changes may be discarded
  confirmDiscard?: () => Awaitable<boolean>
  // Configures navigation protection, or disables it
  navigation?: false | PageNavigationOptions
  // Loads the resource immediately. Defaults to true
  immediate?: boolean
}

const cloneData = <T extends object>(value: T): T => {
  return structuredClone(toRaw(value))
}

/**
 * Provides the common lifecycle for page data: loading, refreshing,
 * dirty tracking, reset, commit and navigation protection
 *
 * @example
 * const page = usePageModel({
 *   load: ({ signal }) => getSettings({ signal }),
 *   confirmDiscard: () => confirmUnsavedChanges(),
 * })
 *
 * const save = async () => {
 *   if (!page.data.value) return
 *
 *   const saved = await saveSettings(page.data.value)
 *   page.commit(saved)
 * }
 */
export const usePageModel = <T extends object, TTracked = T>(options: PageModelOptions<T, TTracked>) => {
  const clone = options.clone ?? cloneData
  const data = shallowRef<T>()
  const baseline = shallowRef<T>()
  const resource = useAsyncResource<T>(async context => clone(await options.load(context)))
  const ready = computed(() => resource.ready.value && data.value !== undefined && baseline.value !== undefined)
  const changes = useChangeTracker(data, baseline, ready, options.changes)
  const loadError = computed(() => (resource.ready.value ? undefined : resource.error.value))
  const refreshError = computed(() => (resource.ready.value ? resource.error.value : undefined))
  let discardConfirmation: Promise<boolean> | undefined

  const replaceData = (value: T): void => {
    data.value = reactive(clone(value)) as T
  }

  const acceptData = (value: T): void => {
    baseline.value = clone(value)
    replaceData(value)
  }

  const confirmDiscard = async (): Promise<boolean> => {
    if (!changes.dirty.value) return true
    if (!options.confirmDiscard) return false
    if (discardConfirmation) return discardConfirmation

    discardConfirmation = Promise.resolve(options.confirmDiscard())

    try {
      const isConfirmed = await discardConfirmation
      return isConfirmed || !changes.dirty.value
    } finally {
      discardConfirmation = undefined
    }
  }

  const canReplaceData = async (canDiscardChanges: boolean): Promise<boolean> => {
    if (canDiscardChanges || !ready.value || !changes.dirty.value) return true
    return confirmDiscard()
  }

  const load = async (loadOptions: PageLoadOptions = {}): Promise<boolean> => {
    const canDiscardChanges = loadOptions.discardChanges === true
    const isAllowed = await canReplaceData(canDiscardChanges)
    if (!isAllowed) return false

    const current = data.value
    const snapshot = current === undefined ? undefined : clone(toRaw(current))

    const result = await resource.load()
    if (result === undefined) return false

    if (
      !canDiscardChanges &&
      snapshot !== undefined &&
      data.value !== undefined &&
      changes.isChanged(data.value, snapshot)
    ) {
      return false
    }

    acceptData(result)

    return true
  }

  const reload = async (loadOptions: PageLoadOptions = {}): Promise<boolean> => {
    return load(loadOptions)
  }

  const reset = (): void => {
    const value = baseline.value
    if (value === undefined) return

    replaceData(value)
  }

  const commit = (value?: T): void => {
    const current = value ?? data.value
    if (current === undefined) return

    const committed = clone(toRaw(current))
    resource.replace(committed)
    baseline.value = clone(committed)

    if (value !== undefined) {
      replaceData(committed)
    }
  }

  const navigation = options.navigation === false ? undefined : (options.navigation ?? {})

  if (navigation && options.confirmDiscard) {
    usePageNavigationGuard(changes.dirty, {
      confirm: confirmDiscard,
      routeUpdates: navigation.routeUpdates,
      browserUnload: navigation.browserUnload,
    })
  }

  if (options.immediate !== false) {
    void load({
      discardChanges: true,
    }).catch(() => {
      /* empty */
    })
  }

  return {
    data: shallowReadonly(data),

    ready,
    loading: resource.loading,
    refreshing: resource.refreshing,

    error: resource.error,
    loadError,
    refreshError,

    dirty: changes.dirty,

    load,
    reload,
    reset,
    commit,

    cancel: resource.cancel,
  }
}
