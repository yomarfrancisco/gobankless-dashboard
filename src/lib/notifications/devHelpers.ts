/**
 * Dev helper functions for testing notifications
 * Usage: window.debugNotify('payment_sent')
 * Usage: window.debugAiExamples() - shows 3 example AI trade notifications
 * Usage: window.debugSeedActivity() - seeds activity store with sample items
 */

import { useNotificationStore } from '@/store/notifications'
import { useActivityStore } from '@/store/activity'

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

  // @ts-ignore
  window.debugSeedActivity = () => {
    const activityStore = useActivityStore.getState()
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    const oneDay = 24 * oneHour
    const threeDays = 3 * oneDay
    const tenDays = 10 * oneDay

    activityStore.addMany([
      {
        id: crypto.randomUUID(),
        actor: { type: 'ai' },
        title: 'AI trade executed',
        body: "Rebalanced: sold 1.86 PEPE, bought 0.04 ETH. — Reason: short-term volatility spike in PEPE; shifting risk to ETH's steadier trend.",
        amount: { currency: 'ZAR', value: 120.50, sign: 'debit' },
        createdAt: now - oneHour,
        routeOnTap: '/activity',
      },
      {
        id: crypto.randomUUID(),
        actor: { type: 'user' },
        title: 'Payment sent',
        body: 'You sent R100 to recipient@email.com for "Deposit for the next batch. Thanx."',
        amount: { currency: 'ZAR', value: 100, sign: 'debit' },
        createdAt: now - 2 * oneHour,
        routeOnTap: '/activity',
      },
      {
        id: crypto.randomUUID(),
        actor: { type: 'user' },
        title: 'Payment received',
        body: 'sender@email.com sent you R250 for "[reference]"',
        amount: { currency: 'ZAR', value: 250, sign: 'credit' },
        createdAt: now - oneDay,
        routeOnTap: '/activity',
      },
      {
        id: crypto.randomUUID(),
        actor: { type: 'ai' },
        title: 'AI trade executed',
        body: 'Reduced ETH exposure by 0.5%. — Reason: CPI print hotter than forecast; raising cash buffer.',
        amount: { currency: 'ZAR', value: 85.30, sign: 'debit' },
        createdAt: now - threeDays,
        routeOnTap: '/activity',
      },
      {
        id: crypto.randomUUID(),
        actor: { type: 'user' },
        title: 'Refund issued',
        body: 'We refunded R100 to your card • Ref: 9X3K…',
        amount: { currency: 'ZAR', value: 100, sign: 'credit' },
        createdAt: now - tenDays,
        routeOnTap: '/activity',
      },
    ])
  }

  // @ts-ignore
  window.debugIdentityExamples = () => {
    const push = store.pushNotification

    // 1. Me / user
    push({
      kind: 'payment_sent',
      title: 'You sent R120 to Nomsa',
      body: 'Payment complete.',
      actor: { type: 'user' },
    })

    // 2. AI manager
    push({
      kind: 'ai_trade',
      title: 'AI manager rebalanced your portfolio',
      body: 'Shifted R250 from PEPE to USDT.',
      actor: { type: 'ai_manager' },
    })

    // 3. Co-op
    push({
      kind: 'payment_received',
      title: 'Co-op reached R10,000',
      body: 'New contribution added to the shared pool.',
      actor: { type: 'co_op', name: 'GoBankless Co-op' },
    })

    // 4. Member
    push({
      kind: 'payment_received',
      title: 'Amanda topped up R50',
      body: 'Member nearby just contributed.',
      actor: {
        type: 'member',
        id: 'demo-amanda',
        name: 'Amanda',
        handle: '@amanda',
        avatar: '/assets/avatar_agent2.png',
      },
    })

    // 5. System
    push({
      kind: 'payment_failed',
      title: 'Network issue',
      body: "We'll retry your payment in a moment.",
      actor: { type: 'system', name: 'System' },
    })
  }
}

