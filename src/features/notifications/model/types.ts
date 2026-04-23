export type NotificationKind = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string
  title?: string
  message: string
  kind: NotificationKind
  timeout?: number
}
