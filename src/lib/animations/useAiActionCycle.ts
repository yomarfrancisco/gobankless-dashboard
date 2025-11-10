'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { CardStackHandle } from '@/components/CardStack'
import { useNotificationStore } from '@/store/notifications'
import { usePortfolioStore } from '@/store/portfolio'
import { updatePortfolioHolding } from '@/lib/portfolio/calculateMetrics'

type CardType = 'pepe' | 'savings' | 'yield'

export const FLIP_MS = 300 // do not change
export const CASH_UPDATE_DELAY_MS = FLIP_MS + 150 // small perceptible delay after flip back
const INTERVAL_MS = 7000 // time between actions
const SLOT_MS = 700 // slot animation duration per update
const DELTA_MIN = 5 // USDT min move
const DELTA_MAX = 40 // USDT max move

type BalanceUpdaters = {
  getCash: () => number
  getEth: () => number
  getPepe: () => number
  setCash: (value: number) => void
  setEth: (value: number) => void
  setPepe: (value: number) => void
  onSlotUpdate?: (cardType: CardType, oldValue: number, newValue: number) => void
}

export function useAiActionCycle(
  cardStackRef: React.RefObject<CardStackHandle | null>,
  balanceUpdaters: BalanceUpdaters
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isRunningRef = useRef(false)
  const isProcessingRef = useRef(false)
  const pushNotification = useNotificationStore((state) => state.pushNotification)
  const setHolding = usePortfolioStore((state) => state.setHolding)

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

  const processAction = useCallback(async () => {
    if (isProcessingRef.current || !cardStackRef.current) return
    isProcessingRef.current = true

    try {
      const { getCash, getEth, getPepe, setCash, setEth, setPepe } = balanceUpdaters

      const cash = getCash()
      const eth = getEth()
      const pepe = getPepe()

      // Pick target: random among non-cash cards that have balance > 0
      const nonCashCards: Array<{ type: CardType; balance: number }> = []
      if (eth > 0) nonCashCards.push({ type: 'yield', balance: eth })
      if (pepe > 0) nonCashCards.push({ type: 'pepe', balance: pepe })

      // Suppress flips without balance changes - ensure we have a valid target
      if (nonCashCards.length === 0 && cash === 0) {
        // No valid action possible
        return
      }

      // If no non-cash cards have balance, allow buying from cash
      if (nonCashCards.length === 0 && cash > 0) {
        // Randomly pick ETH or PEPE to buy
        const targetType = Math.random() < 0.5 ? 'yield' : 'pepe'
        const delta = rnd(DELTA_MIN, Math.min(DELTA_MAX, Math.floor(cash / 18.1))) // Convert ZAR to USDT estimate

        if (delta > 0) {
          // 1) Flip forward to target
          await cardStackRef.current.flipToCard(targetType, 'forward')
          await sleep(FLIP_MS + 50)

          // 2) Update target card state (SlotCounter will animate from old to new)
          const oldTarget = targetType === 'yield' ? eth : pepe
          const newTarget = oldTarget + delta
          const zarDelta = delta * 18.1
          const newCashValue = Math.max(0, cash - zarDelta)

          if (targetType === 'yield') {
            setEth(newTarget)
          } else {
            setPepe(newTarget)
          }

          // 3) Wait for target slot animation
          await sleep(SLOT_MS)

          // 4) Flip back to Cash (reverse direction)
          await cardStackRef.current.flipToCard('savings', 'back')
          await sleep(FLIP_MS + 50)

          // 5) After flip back completes + delay, update cash (triggers slot animation)
          await sleep(CASH_UPDATE_DELAY_MS)
          setCash(newCashValue)

          // 6) Wait for cash slot animation
          await sleep(SLOT_MS)
        }
      } else if (nonCashCards.length > 0) {
        // Pick random non-cash card
        const target = nonCashCards[rnd(0, nonCashCards.length - 1)]
        const targetType = target.type

        // Compute delta: random with sign (+/-) with guardrails
        const sign = Math.random() < 0.5 ? -1 : 1
        let delta = rnd(DELTA_MIN, DELTA_MAX) * sign

        // Clamp: if selling, ensure we don't exceed target balance
        if (delta < 0 && Math.abs(delta) > target.balance) {
          delta = -target.balance
        }

        // Clamp: if buying, ensure we don't exceed available cash
        if (delta > 0) {
          const maxBuy = Math.floor(cash / 18.1) // Rough USDT conversion
          if (delta > maxBuy) {
            delta = maxBuy
          }
        }

        if (delta !== 0) {
          // 1) Flip forward to target
          await cardStackRef.current.flipToCard(targetType, 'forward')
          await sleep(FLIP_MS + 50)

          // 2) Calculate new values
          const oldTarget = target.balance
          const newTarget = Math.max(0, oldTarget + delta)
          const zarDelta = delta * 18.1
          const newCashValue = Math.max(0, cash - zarDelta)
          const totalZAR = cash + (eth * 18.1) + (pepe * 18.1)

          // 3) Start health + allocation% tween immediately (delay: 0ms)
          const targetSymbol = targetType === 'yield' ? 'ETH' : 'PEPE'
          const newTargetZAR = newTarget * 18.1
          const baseHealth = targetType === 'yield' ? 60 : 25
          const targetHolding = updatePortfolioHolding(targetSymbol as 'ETH' | 'PEPE', newTargetZAR, totalZAR, baseHealth)
          setHolding(targetHolding)

          // 4) Update target card state (SlotCounter will animate from old to new after ~120ms stagger)
          if (targetType === 'yield') {
            setEth(newTarget)
          } else {
            setPepe(newTarget)
          }

          // Emit AI trade notification
          const assetName = targetType === 'yield' ? 'ETH' : 'PEPE'
          const zarAmount = Math.abs(delta * 18.1)
          const action = delta > 0 ? 'bought' : 'sold'
          pushNotification({
            kind: 'ai_trade',
            title: 'AI trade executed',
            body: `Rebalanced: ${action} ${Math.abs(delta)} ${assetName} (R${zarAmount.toFixed(2)}).`,
            amount: {
              currency: 'ZAR',
              value: delta > 0 ? -zarAmount : zarAmount,
            },
            direction: delta > 0 ? 'down' : 'up',
            actor: {
              type: 'ai',
            },
            routeOnTap: '/transactions',
          })

          // 5) Wait for target slot animation (staggered: health/allocation start at 0ms, slot counter starts at ~120ms)
          await sleep(SLOT_MS)

          // 4) Flip back to Cash (reverse direction)
          await cardStackRef.current.flipToCard('savings', 'back')
          await sleep(FLIP_MS + 50)

          // 5) After flip back completes + delay, update cash (triggers slot animation)
          await sleep(CASH_UPDATE_DELAY_MS)
          setCash(newCashValue)

          // 6) Wait for cash slot animation
          await sleep(SLOT_MS)
        }
      }
    } finally {
      isProcessingRef.current = false
    }
  }, [cardStackRef, balanceUpdaters])

  const start = useCallback(() => {
    if (isRunningRef.current) return
    isRunningRef.current = true

    const scheduleNext = () => {
      intervalRef.current = setTimeout(async () => {
        if (isRunningRef.current && cardStackRef.current) {
          await processAction()
          scheduleNext()
        }
      }, INTERVAL_MS)
    }

    scheduleNext()
  }, [cardStackRef, processAction])

  const stop = useCallback(() => {
    isRunningRef.current = false
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    start()
    return () => {
      stop()
    }
  }, [start, stop])

  return {
    start,
    stop,
  }
}
