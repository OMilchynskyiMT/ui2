import { inject } from 'vue'

import { NotificationsKey } from '../symbols'

export function useNotifications() {
  const service = inject(NotificationsKey)

  if (!service) {
    throw new Error('Notifications plugin is not installed')
  }

  return service
}

export function useNotify() {
  const notifications = useNotifications()

  return {
    info: notifications.info,
    success: notifications.success,
    warning: notifications.warning,
    error: notifications.error,
    remove: notifications.remove,
    clear: notifications.clear,
  }
}
