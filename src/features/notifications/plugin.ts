import type { App } from 'vue'

import { createNotificationsService, type NotificationsPluginOptions } from './services/notifications.service'
import { NotificationsKey } from './symbols'

export function createNotificationsPlugin(options: NotificationsPluginOptions = {}) {
  const service = createNotificationsService(options)

  return {
    install(app: App) {
      app.provide(NotificationsKey, service)
    },
  }
}
