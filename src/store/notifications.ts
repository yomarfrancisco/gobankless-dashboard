import { create } from 'zustand'
import { useActivityStore } from './activity'
import { joinActionAndReason } from '@/lib/notifications/formatReason'

export type NotificationKind =
  | 'payment_sent'
  | 'payment_received'
  | 'request_sent'
  | 'payment_failed'
  | 'refund'
  | 'ai_trade'
  | 'mode-change'

export type NotificationItem = {
  id: string // uuid
  kind: NotificationKind
  title: string // e.g., "Payment sent", "Payment received", "Payment failed", "AI trade executed"
  body?: string // detail line (non-bold) - kept for backward compatibility
  action?: string // e.g., "Rebalanced: sold 1.2 PEPE, bought 0.01 ETH."
  reason?: string // e.g., "Reason: volatility crossed 25%—moved to cash."
  amount?: {
    // optional: for later Transactions page
    currency: 'ZAR' | 'USDT'
    value: number // positive for inflow, negative for outflow
  }
  direction?: 'up' | 'down' // inflow/outflow (for Transactions derivation)
  actor?: {
    type: 'ai' | 'user'
    avatarUrl?: string // user avatar if available
  }
  timestamp: number // ms since epoch
  routeOnTap?: string // e.g., '/transactions' or deep link
}

type NotificationState = {
  notifications: NotificationItem[]
  pushNotification: (item: Omit<NotificationItem, 'id' | 'timestamp'>) => void
  dismissNotification: (id: string) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  pushNotification: (item) => {
    const notification: NotificationItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    set((state) => ({
      notifications: [...state.notifications, notification].slice(-10), // Keep max 10 in queue
    }))

    // Also add to activity store
    const activityStore = useActivityStore.getState()
    // Get detail text using the same formatter as notifications
    const detail = getNotificationDetail(notification)
    activityStore.add({
      id: notification.id,
      actor: notification.actor || { type: 'user' },
      title: notification.title,
      body: detail || undefined,
      amount: notification.amount
        ? {
            currency: notification.amount.currency,
            value: Math.abs(notification.amount.value),
            sign: notification.amount.value >= 0 ? 'credit' : 'debit',
          }
        : undefined,
      createdAt: notification.timestamp,
      routeOnTap: notification.routeOnTap,
    })
  },
  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
  clearNotifications: () => {
    set({ notifications: [] })
  },
}))

/**
 * Get notification detail text from action, reason, or body
 * Prefers explicit body; else joins action + reason with proper punctuation
 */
export function getNotificationDetail(n: NotificationItem): string {
  // Prefer explicit body
  if (n.body) return n.body

  // Join action + reason with proper punctuation (no ". —" sequences)
  if (n.action && n.reason) {
    return joinActionAndReason(n.action, n.reason)
  }

  // Fallback to whichever is available
  return n.action || n.reason || ''
}

