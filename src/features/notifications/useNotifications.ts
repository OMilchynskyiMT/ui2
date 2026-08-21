import { computed, ref } from 'vue'
import { CheckIcon, LightbulbIcon, OctagonXIcon, TriangleAlertIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'

import type { Notification, NotificationOptions } from './types'

const notifications = ref<Notification[]>([])
const timeoutHandles = new Map<string, ReturnType<typeof setTimeout>>()

const VISIBLE_ITEMS = 5

type PushOptions = Omit<NotificationOptions, 'kind'> & {
  message: string
  kind: Notification['kind']
}

const latests = computed((): Notification[] => {
  return notifications.value.slice(-VISIBLE_ITEMS)
})

const isExists = (id: string): boolean => {
  return notifications.value.some(item => item.id === id)
}

const clearTimeoutHandle = (id: string): void => {
  const handle = timeoutHandles.get(id)
  if (handle === undefined) return

  clearTimeout(handle)
  timeoutHandles.delete(id)
}

const remove = (id: string): void => {
  clearTimeoutHandle(id)
  const index = notifications.value.findIndex(item => item.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
    syncTimeouts()
  }
}

const pauseTimeout = (notification: Notification): void => {
  const handle = timeoutHandles.get(notification.id)
  if (handle === undefined) return

  clearTimeout(handle)
  timeoutHandles.delete(notification.id)
  if (notification.expiresAt !== undefined) {
    notification.timeoutRemaining = Math.max(0, notification.expiresAt - Date.now())
  }
  notification.expiresAt = undefined
}

const startTimeout = (notification: Notification): void => {
  if (!notification.timeout || timeoutHandles.has(notification.id)) return
  const remaining = notification.timeoutRemaining ?? notification.timeout
  if (remaining <= 0) {
    remove(notification.id)
    return
  }

  notification.timeoutRemaining = remaining
  notification.expiresAt = Date.now() + remaining
  const handle = setTimeout(() => {
    timeoutHandles.delete(notification.id)
    remove(notification.id)
  }, remaining)
  timeoutHandles.set(notification.id, handle)
}

const syncTimeouts = (): void => {
  const visibleIds = new Set(latests.value.map(item => item.id))
  for (const notification of notifications.value) {
    if (!notification.timeout) continue

    if (visibleIds.has(notification.id)) {
      startTimeout(notification)
    } else {
      pauseTimeout(notification)
    }
  }
}

const push = (options: PushOptions): string => {
  const id = options.id ?? useId('notification-')

  if (!isExists(id)) {
    notifications.value.push({
      ...options,
      id,
      createdAt: new Date(),
    })

    syncTimeouts()
  }

  return id
}

const error = (message: string, options?: NotificationOptions): string => {
  return push({
    ...options,
    message,
    kind: 'error',
    icon: options?.icon ?? OctagonXIcon,
  })
}

const warning = (message: string, options?: NotificationOptions): string => {
  return push({
    ...options,
    message,
    kind: 'warning',
    icon: options?.icon ?? TriangleAlertIcon,
  })
}

const info = (message: string, options?: NotificationOptions): string => {
  return push({
    ...options,
    message,
    kind: 'info',
    icon: options?.icon ?? LightbulbIcon,
  })
}

const success = (message: string, options?: NotificationOptions): string => {
  return push({
    ...options,
    message,
    kind: 'success',
    icon: options?.icon ?? CheckIcon,
  })
}

const notify = (message: string, options?: NotificationOptions): string => {
  return push({
    ...options,
    message,
    kind: options?.kind ?? 'neutral',
  })
}

const clear = (): void => {
  for (const handle of timeoutHandles.values()) {
    clearTimeout(handle)
  }

  timeoutHandles.clear()
  notifications.value = []
}

export const useNotifications = () => ({
  notifications,
  latests,
  isExists,
  error,
  warning,
  info,
  success,
  notify,
  remove,
  clear,
})
