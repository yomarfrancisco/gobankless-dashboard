/**
 * Dev helper functions for testing notifications
 * Usage: window.debugNotify('payment_sent')
 * Usage: window.debugAiExamples() - shows 3 example AI trade notifications
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
        action: 'Rebalanced: bought 12 PEPE (R120).',
        reason: 'Reason: portfolio rebalancing to maintain target allocation.',
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

  // @ts-ignore
  window.debugAiExamples = () => {
    const pushNotification = store.pushNotification

    pushNotification({
      kind: 'ai_trade',
      title: 'AI trade executed',
      action: 'Rebalanced: sold 1.86 PEPE, bought 0.04 ETH.',
      reason: "Reason: short-term volatility spike in PEPE; shifting risk to ETH's steadier trend.",
      actor: { type: 'ai' },
      routeOnTap: '/transactions',
    })

    pushNotification({
      kind: 'ai_trade',
      title: 'AI trade executed',
      action: 'Reduced ETH exposure by 0.5%.',
      reason: 'Reason: CPI print hotter than forecast; raising cash buffer.',
      actor: { type: 'ai' },
    })

    pushNotification({
      kind: 'ai_trade',
      title: 'AI trade executed',
      action: 'Added 2.4 PEPE after retracement.',
      reason: 'Reason: sentiment reversed from RSI 28 to neutral; capturing rebound zone.',
      actor: { type: 'ai' },
    })
  }
}

