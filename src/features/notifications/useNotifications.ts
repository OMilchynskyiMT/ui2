import { computed, ref } from 'vue'
import { CheckIcon, LightbulbIcon, OctagonXIcon, TriangleAlertIcon } from '@lucide/vue'

import { useId } from '@/composables/useId'

import type { Notification } from './types'

const notifications = ref<Notification[]>([])
const VISIBLE_ITEMS = 5

const isExists = (id: string): boolean => {
  return notifications.value.some(item => item.id === id)
}

const push = (options: Omit<Notification, 'id' | 'createdAt'> & Partial<Pick<Notification, 'id'>>): string => {
  const id = options.id ?? useId('notification-')
  console.log('not id', id)
  if (!isExists(id)) notifications.value.push({ id, createdAt: new Date(), ...options })
  return id
}

const error = (message: string, options?: Partial<Notification>): string => {
  return push({ ...options, message, kind: 'error', icon: options?.icon ?? OctagonXIcon })
}

const warning = (message: string, options?: Partial<Notification>): string => {
  return push({ ...options, message, kind: 'warning', icon: options?.icon ?? TriangleAlertIcon })
}

const info = (message: string, options?: Partial<Notification>): string => {
  return push({ ...options, message, kind: 'info', icon: options?.icon ?? LightbulbIcon })
}

const success = (message: string, options?: Partial<Notification>): string => {
  return push({ ...options, message, kind: 'success', icon: options?.icon ?? CheckIcon })
}

const notify = (message: string, options?: Partial<Notification>): string => {
  return push({ ...options, message, kind: options?.kind ?? 'neutral' })
}

const remove = (id: string): void => {
  const index = notifications.value.findIndex(item => item.id === id)
  if (index !== -1) notifications.value.splice(index, 1)
}

const clear = (): void => {
  notifications.value = []
}

const latests = computed((): Notification[] => {
  return notifications.value.slice(-VISIBLE_ITEMS)
})

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
