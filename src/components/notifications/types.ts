import type { Component } from 'vue'

import type { FeedbackTone } from '@/lib/components/component.types'

export type NotificationPauseReason = 'pointer' | 'focus'

export type NotificationOptions = {
  id?: string
  title?: string
  tone?: FeedbackTone
  timeout?: number
  icon?: Component
}

export type Notification = {
  id: string
  title?: string
  message: string
  tone: FeedbackTone
  timeout?: number

  // Runtime timeout state
  timeoutRemaining?: number
  expiresAt?: number
  paused?: boolean

  icon?: Component
  createdAt: Date
}
