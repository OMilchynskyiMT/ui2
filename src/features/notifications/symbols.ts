import type { InjectionKey } from 'vue'

import type { NotificationsService } from './services/notifications.service'

export const NotificationsKey: InjectionKey<NotificationsService> = Symbol('Notifications')
