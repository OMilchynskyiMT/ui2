import { computed, ref } from 'vue'
import { CheckIcon, LightbulbIcon, OctagonXIcon, TriangleAlertIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'

import type { Notification, NotificationOptions, NotificationPauseReason } from './types'

const notifications = ref<Notification[]>([])
const timeoutHandles = new Map<string, ReturnType<typeof setTimeout>>()
const pauseReasons = new Map<string, Set<NotificationPauseReason>>()

const VISIBLE_ITEMS = 5

type PushOptions = Omit<NotificationOptions, 'tone'> & {
  message: string
  tone: Notification['tone']
}

const visibleNotifications = computed((): Notification[] => {
  return notifications.value.slice(-VISIBLE_ITEMS)
})

const getNotification = (id: string): Notification | undefined => {
  return notifications.value.find(item => item.id === id)
}

const isExists = (id: string): boolean => getNotification(id) !== undefined
const isVisible = (id: string): boolean => visibleNotifications.value.some(item => item.id === id)
const isInteractionPaused = (id: string): boolean => (pauseReasons.get(id)?.size ?? 0) > 0

const clearTimeoutHandle = (id: string): void => {
  const handle = timeoutHandles.get(id)
  if (handle === undefined) return

  clearTimeout(handle)
  timeoutHandles.delete(id)
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

const remove = (id: string): void => {
  clearTimeoutHandle(id)
  pauseReasons.delete(id)

  const index = notifications.value.findIndex(item => item.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
    syncTimeouts()
  }
}

const startTimeout = (notification: Notification): void => {
  if (!notification.timeout || timeoutHandles.has(notification.id) || isInteractionPaused(notification.id)) return

  const remaining = notification.timeoutRemaining ?? notification.timeout
  if (remaining <= 0) {
    remove(notification.id)
    return
  }

  notification.paused = false
  notification.timeoutRemaining = remaining
  notification.expiresAt = Date.now() + remaining

  const handle = setTimeout(() => {
    timeoutHandles.delete(notification.id)
    remove(notification.id)
  }, remaining)
  timeoutHandles.set(notification.id, handle)
}

const syncTimeouts = (): void => {
  const visibleIds = new Set(visibleNotifications.value.map(item => item.id))

  for (const notification of notifications.value) {
    if (!notification.timeout) continue

    if (visibleIds.has(notification.id) && !isInteractionPaused(notification.id)) {
      notification.paused = false
      startTimeout(notification)
    } else {
      pauseTimeout(notification)
      notification.paused = true
    }
  }
}

const pause = (id: string, reason: NotificationPauseReason): void => {
  const notification = getNotification(id)
  if (!notification?.timeout) return

  const reasons = pauseReasons.get(id) ?? new Set<NotificationPauseReason>()
  reasons.add(reason)
  pauseReasons.set(id, reasons)

  pauseTimeout(notification)
  notification.paused = true
}

const resume = (id: string, reason: NotificationPauseReason): void => {
  const notification = getNotification(id)
  if (!notification?.timeout) return

  const reasons = pauseReasons.get(id)
  reasons?.delete(reason)
  if (reasons?.size === 0) pauseReasons.delete(id)

  if (isInteractionPaused(id) || !isVisible(id)) return

  notification.paused = false
  startTimeout(notification)
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
    tone: 'danger',
    icon: options?.icon ?? OctagonXIcon,
  })
}

const warning = (message: string, options?: NotificationOptions): string => {
  return push({
    ...options,
    message,
    tone: 'warning',
    icon: options?.icon ?? TriangleAlertIcon,
  })
}

const info = (message: string, options?: NotificationOptions): string => {
  return push({
    ...options,
    message,
    tone: 'info',
    icon: options?.icon ?? LightbulbIcon,
  })
}

const success = (message: string, options?: NotificationOptions): string => {
  return push({
    ...options,
    message,
    tone: 'success',
    icon: options?.icon ?? CheckIcon,
  })
}

const notify = (message: string, options?: NotificationOptions): string => {
  return push({
    ...options,
    message,
    tone: options?.tone ?? 'neutral',
  })
}

const clear = (): void => {
  for (const handle of timeoutHandles.values()) {
    clearTimeout(handle)
  }

  timeoutHandles.clear()
  pauseReasons.clear()
  notifications.value = []
}

export const useNotifications = () => ({
  notifications,
  visibleNotifications,
  isExists,
  error,
  warning,
  info,
  success,
  notify,
  pause,
  resume,
  remove,
  clear,
})
