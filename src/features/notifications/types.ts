import type { Component } from "vue"

export type NotificationKind = "success" | "info" | "warning" | "error" | 'neutral'

export type NotificationOptions = {
  id?: string
  title?: string
  kind?: NotificationKind
  timeout?: number
  icon?: Component
}

export type Notification = {
  id: string
  title?: string
  message: string
  kind: NotificationKind
  timeout?: number

  // Runtime timeout state
  timeoutRemaining?: number
  expiresAt?: number

  icon?: Component
  createdAt: Date
}
