import type { Component } from "vue"

export type NotificationKind = "success" | "info" | "warning" | "error" | 'neutral'

export type Notification = {
  id: string
  title?: string
  message: string
  kind: NotificationKind
  timeout?: number
  icon?: Component
  createdAt: Date
}
