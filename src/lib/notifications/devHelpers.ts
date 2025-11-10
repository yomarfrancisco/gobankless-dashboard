/**
 * Dev helper functions for testing notifications
 * Usage: window.debugNotify('payment_sent')
 */

import { useNotificationStore } from '@/store/notifications'

export function setupDevNotificationHelpers() {
  if (typeof window === 'undefined') return

  const store = useNotificationStore.getState()

  // @ts-ignore
  window.debugNotify = (kind: string, options?: Partial<any>) => {
    const baseNotification = {
      kind: kind as any,
      title: 'Test Notification',
      body: 'This is a test notification body.',
      actor: {
        type: 'user' as const,
      },
      routeOnTap: '/transactions',
    }

    const examples: Record<string, any> = {
      payment_sent: {
        ...baseNotification,
        kind: 'payment_sent',
        title: 'Payment sent',
        body: "You sent R100 to recipient@email.com for 'Deposit for the next batch. Thanx.'",
        amount: { currency: 'ZAR', value: -100 },
        direction: 'down',
      },
      payment_received: {
        ...baseNotification,
        kind: 'payment_received',
        title: 'Payment received',
        body: 'sender@email.com sent you R100 for "[reference]"',
        amount: { currency: 'ZAR', value: 100 },
        direction: 'up',
      },
      request_sent: {
        ...baseNotification,
        kind: 'request_sent',
        title: 'Request sent',
        body: "You requested R100 from recipient@email.com for '[reference]'.",
        amount: { currency: 'ZAR', value: 100 },
        direction: 'up',
      },
      payment_failed: {
        ...baseNotification,
        kind: 'payment_failed',
        title: 'Payment failed',
        body: 'Your payment could not be processed and has been fully refunded.',
        direction: 'down',
      },
      refund: {
        ...baseNotification,
        kind: 'refund',
        title: 'Refund issued',
        body: 'We refunded R100 to your card • Ref: 9X3K…',
        amount: { currency: 'ZAR', value: 100 },
        direction: 'up',
      },
      ai_trade: {
        ...baseNotification,
        kind: 'ai_trade',
        title: 'AI trade executed',
        body: 'Rebalanced: bought 12 PEPE (R120).',
        amount: { currency: 'ZAR', value: -120 },
        direction: 'down',
        actor: {
          type: 'ai' as const,
        },
      },
    }

    const notification = examples[kind] || { ...baseNotification, kind }
    store.pushNotification({ ...notification, ...options })
  }
}

