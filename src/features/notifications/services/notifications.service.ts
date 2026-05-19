import { readonly, ref } from 'vue'

import type { Notification, NotificationInput, NotificationOptions, NotificationsPluginOptions } from '../model/types'

export function createNotificationsService(_options: NotificationsPluginOptions = {}) {
  const items = ref<Notification[]>([])

  function push(input: NotificationInput) {
    if (input.id && items.value.some(item => item.id === input.id)) {
      return input.id
    }

    const item: Notification = {
      id: (input.id ??= crypto.randomUUID()),
      title: input.title,
      message: input.message,
      kind: input.kind,
      timeout: input.timeout,
    }

    items.value.push(item)

    if (item.timeout && item.timeout > 0) {
      globalThis.setTimeout(() => remove(item.id), item.timeout)
    }

    return item.id
  }

  function info(message: string, options?: NotificationOptions) {
    return push({
      message,
      kind: 'info',
      ...options,
    })
  }

  function success(message: string, options?: NotificationOptions) {
    return push({
      message,
      kind: 'success',
      ...options,
    })
  }

  function warning(message: string, options?: NotificationOptions) {
    return push({
      message,
      kind: 'warning',
      ...options,
    })
  }

  function error(message: string, options?: NotificationOptions) {
    return push({
      message,
      kind: 'error',
      ...options,
    })
  }

  function remove(id: string) {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) items.value.splice(index, 1)
  }

  function clear() {
    items.value = []
  }

  return {
    items: readonly(items),
    info,
    success,
    warning,
    error,
    remove,
    clear,
  }
}

export type NotificationsService = ReturnType<typeof createNotificationsService>
