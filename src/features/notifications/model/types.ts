export type NotificationKind = 'info' | 'success' | 'warning' | 'error'

export type Notification = {
  id: string
  title?: string
  message: string
  kind: NotificationKind
  timeout?: number
}

// omits message and kind
export type NotificationOptions = Partial<Omit<Notification, 'message' | 'kind'>>
// makes id optional
export type NotificationInput = Omit<Notification, 'id'> & Partial<Pick<Notification, 'id'>>

export type NotificationsPluginOptions = {
  max?: number
}
