import { computed, onScopeDispose, reactive, readonly, ref, shallowReadonly, shallowRef, toRaw, watch } from 'vue'

import { type AsyncResourceLoader, useAsyncResource } from './useAsyncResource'
import { type ChangeTrackerOptions, useChangeTracker } from './useChangeTracker'
import { type PageNavigationGuardOptions, usePageNavigationGuard } from './usePageNavigationGuard'

type Awaitable<T> = T | Promise<T>

export type PageLoadOptions = {
  // How a replacement load behaves when the current model has unsaved changes.
  // Defaults to 'confirm'. 'skip' is intended for automatic refresh/polling.
  ifDirty?: 'confirm' | 'discard' | 'skip'
}

export type PageNavigationOptions = Omit<PageNavigationGuardOptions, 'confirm' | 'blocked'>

export type PageModelOptions<T extends object, TTracked = T> = {
  load: AsyncResourceLoader<T>
  // Returns the complete persisted model, including server normalization
  // Receives an isolated snapshot; failures must reject
  save?: (value: T) => Promise<T>
  // Overrides the default structured-clone behavior
  clone?: (value: T) => T
  // Configures which model state participates in dirty tracking
  changes?: ChangeTrackerOptions<T, TTracked>
  // Confirms whether unsaved changes may be discarded. When provided,
  // navigation protection also guards dirty data
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
 * saving, dirty tracking, reset, commit and navigation protection
 *
 * @example
 * const page = usePageModel({
 *   load: ({ signal }) => getSettings({ signal }),
 *   save: value => saveSettings(value),
 *   confirmDiscard: () => confirmUnsavedChanges(),
 * })
 *
 * await page.save()
 * // Bind saveError inline, keeping the form mounted while saving
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
  const saving = ref(false)
  const saveError = shallowRef<unknown>()
  const pending = computed(() => resource.pending.value || saving.value)
  let isDisposed = false
  let revision = 0
  let operation = 0
  let currentSave: Promise<boolean> | undefined

  // Track all edits, including fields excluded from dirty tracking.
  watch(
    data,
    () => {
      ++revision
    },
    { deep: true, flush: 'sync' }
  )

  let discardConfirmation: Promise<boolean> | undefined

  const replaceData = (value: T): void => {
    data.value = reactive(clone(value)) as T
  }

  const acceptData = (value: T): void => {
    const accepted = clone(value)
    const draft = reactive(clone(value)) as T
    baseline.value = accepted
    data.value = draft
    saveError.value = undefined
  }

  // eslint-disable-next-line unicorn/consistent-boolean-name
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

  const canReplaceData = async (ifDirty: NonNullable<PageLoadOptions['ifDirty']>): Promise<boolean> => {
    if (ifDirty === 'discard' || !ready.value || !changes.dirty.value) return true
    if (ifDirty === 'skip') return false
    return confirmDiscard()
  }

  // eslint-disable-next-line unicorn/consistent-boolean-name
  const load = async (loadOptions: PageLoadOptions = {}): Promise<boolean> => {
    if (isDisposed || saving.value) return false
    const currentOperation = ++operation
    const confirmationRevision = revision
    const isAllowed = await canReplaceData(loadOptions.ifDirty ?? 'confirm')

    if (
      !isAllowed ||
      isDisposed ||
      currentOperation !== operation ||
      confirmationRevision !== revision ||
      saving.value
    ) {
      return false
    }

    const loadRevision = revision
    const result = await resource.load()
    if (isDisposed || result === undefined || currentOperation !== operation || loadRevision !== revision) {
      return false
    }

    acceptData(result)

    return true
  }

  const cancelLoad = (): void => {
    ++operation
    resource.cancel()
  }

  const assertMutable = (): void => {
    if (isDisposed || saving.value) throw new Error('Cannot replace page data while saving or after disposal')
  }

  const reset = (): void => {
    assertMutable()
    cancelLoad()
    const value = baseline.value
    if (value === undefined) return

    replaceData(value)
    saveError.value = undefined
  }

  const commit = (value?: T): void => {
    assertMutable()
    cancelLoad()
    const current = value ?? data.value
    if (current === undefined) return

    saveError.value = undefined
    const committed = clone(toRaw(current))
    resource.replace(committed)
    baseline.value = clone(committed)

    if (value !== undefined) {
      replaceData(committed)
    }
  }

  // repeated submission joins the active write instead of sending another request
  const save = (): Promise<boolean> => {
    if (currentSave) return currentSave
    if (isDisposed || !ready.value || data.value === undefined) return Promise.resolve(false)
    const saver = options.save
    if (!saver) return Promise.reject(new Error('No page saver configured'))

    cancelLoad()
    const snapshot = clone(toRaw(data.value))
    const saveRevision = revision
    saveError.value = undefined
    saving.value = true

    // eslint-disable-next-line unicorn/consistent-boolean-name
    const execute = async (): Promise<boolean> => {
      // install currentSave before invoking application code, including synchronous failures
      await Promise.resolve()
      try {
        if (isDisposed) return false
        const value = await saver(snapshot)
        if (isDisposed) return false
        // prepare clones before changing the accepted baseline
        const accepted = clone(value)
        const draft = revision === saveRevision ? (reactive(clone(value)) as T) : undefined
        resource.replace(accepted)
        baseline.value = accepted
        if (draft !== undefined) data.value = draft
        return true
      } catch (error) {
        if (!isDisposed) saveError.value = error
        throw error
      } finally {
        saving.value = false
        currentSave = undefined
      }
    }
    currentSave = execute()
    return currentSave
  }

  onScopeDispose(() => {
    isDisposed = true
    cancelLoad()
  })

  const navigation = options.navigation === false ? undefined : (options.navigation ?? {})

  if (navigation) {
    usePageNavigationGuard(
      computed(() => (options.confirmDiscard ? changes.dirty.value : false) || saving.value),
      {
        confirm: confirmDiscard,
        blocked: saving,
        routeUpdates: navigation.routeUpdates,
        browserUnload: navigation.browserUnload,
      }
    )
  }

  if (options.immediate !== false) {
    void load({
      ifDirty: 'discard',
    }).catch(() => {
      // empty
    })
  }

  return {
    data: shallowReadonly(data),

    ready,
    loading: resource.loading,
    refreshing: resource.refreshing,
    saving: readonly(saving),
    pending,
    saveError: shallowReadonly(saveError),

    loadError,
    refreshError,

    dirty: changes.dirty,

    load,
    reset,
    commit,
    save,

    cancelLoad,
  }
}
