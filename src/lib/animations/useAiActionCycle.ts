'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { CardStackHandle } from '@/components/CardStack'
import { useNotificationStore } from '@/store/notifications'
import { usePortfolioStore } from '@/store/portfolio'
import { computePostTrade, deriveHealth, type HoldingsZAR } from '@/lib/portfolio/applyTrade'

const FX_USD_ZAR_DEFAULT = 18.1

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

      // Read current holdings from portfolio store (single source of truth)
      const getHolding = usePortfolioStore.getState().getHolding
      const cashHolding = getHolding('CASH')
      const ethHolding = getHolding('ETH')
      const pepeHolding = getHolding('PEPE')

      // Get current ZAR amounts from portfolio store (single source of truth)
      // Fallback to wallet alloc if portfolio store not initialized
      const prev: HoldingsZAR = {
        CASH: cashHolding?.amountZAR ?? getCash(), // getCash() returns ZAR
        ETH: ethHolding?.amountZAR ?? getEth() * FX_USD_ZAR_DEFAULT, // getEth() returns USDT
        PEPE: pepeHolding?.amountZAR ?? getPepe() * FX_USD_ZAR_DEFAULT, // getPepe() returns USDT
      }

      // Get USDT balances for logic (from wallet alloc)
      const eth = getEth()
      const pepe = getPepe()
      const cash = getCash()

      // Pick target: random among non-cash cards that have balance > 0
      const nonCashCards: Array<{ type: CardType; balance: number }> = []
      if (eth > 0) nonCashCards.push({ type: 'yield', balance: eth })
      if (pepe > 0) nonCashCards.push({ type: 'pepe', balance: pepe })

      // Suppress flips without balance changes - ensure we have a valid target
      if (nonCashCards.length === 0 && cash === 0) {
        // No valid action possible
        return
      }

      // Determine target and delta
      let targetType: CardType
      let delta: number // in USDT

      if (nonCashCards.length === 0 && cash > 0) {
        // If no non-cash cards have balance, allow buying from cash
        targetType = Math.random() < 0.5 ? 'yield' : 'pepe'
        delta = rnd(DELTA_MIN, Math.min(DELTA_MAX, Math.floor(cash / FX_USD_ZAR_DEFAULT)))
      } else {
        // Pick random non-cash card
        const target = nonCashCards[rnd(0, nonCashCards.length - 1)]
        targetType = target.type

        // Compute delta: random with sign (+/-) with guardrails
        const sign = Math.random() < 0.5 ? -1 : 1
        delta = rnd(DELTA_MIN, DELTA_MAX) * sign

        // Clamp: if selling, ensure we don't exceed target balance
        if (delta < 0 && Math.abs(delta) > target.balance) {
          delta = -target.balance
        }

        // Clamp: if buying, ensure we don't exceed available cash
        if (delta > 0) {
          const maxBuy = Math.floor(cash / FX_USD_ZAR_DEFAULT)
          if (delta > maxBuy) {
            delta = maxBuy
          }
        }
      }

      if (delta !== 0) {
        // Convert delta to ZAR
        const deltaZAR = delta * FX_USD_ZAR_DEFAULT
        const targetSymbol: 'ETH' | 'PEPE' = targetType === 'yield' ? 'ETH' : 'PEPE'

        // Compute post-trade state using single source of truth
        const trade = { symbol: targetSymbol, deltaZAR }
        const { next, total, alloc } = computePostTrade(prev, trade)

        // 1) Flip forward to target
        await cardStackRef.current.flipToCard(targetType, 'forward')
        await sleep(FLIP_MS + 50)

        // 2) Update ALL holdings in portfolio store (triggers health/allocation tweens at t=0ms)
        setHolding({
          symbol: 'CASH',
          amountZAR: next.CASH,
          amountUSDT: next.CASH / FX_USD_ZAR_DEFAULT,
          allocationPct: Math.round(alloc.CASH * 100) / 100,
          health: deriveHealth('CASH', next, total),
        })

        setHolding({
          symbol: 'ETH',
          amountZAR: next.ETH,
          amountUSDT: next.ETH / FX_USD_ZAR_DEFAULT,
          allocationPct: Math.round(alloc.ETH * 100) / 100,
          health: deriveHealth('ETH', next, total),
        })

        setHolding({
          symbol: 'PEPE',
          amountZAR: next.PEPE,
          amountUSDT: next.PEPE / FX_USD_ZAR_DEFAULT,
          allocationPct: Math.round(alloc.PEPE * 100) / 100,
          health: deriveHealth('PEPE', next, total),
        })

        // 3) Update wallet allocation (for slot counter animations)
        const newTarget = next[targetSymbol] / FX_USD_ZAR_DEFAULT
        const newCashValue = next.CASH / FX_USD_ZAR_DEFAULT

        if (targetType === 'yield') {
          setEth(newTarget)
        } else {
          setPepe(newTarget)
        }

        // Emit AI trade notification
        const assetName = targetSymbol
        const zarAmount = Math.abs(deltaZAR)
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

        // 4) Wait for target slot animation (staggered: health/allocation start at 0ms, slot counter starts at ~120ms)
        await sleep(SLOT_MS)

        // 5) Flip back to Cash (reverse direction)
        await cardStackRef.current.flipToCard('savings', 'back')
        await sleep(FLIP_MS + 50)

        // 6) After flip back completes + delay, update cash (triggers slot animation)
        await sleep(CASH_UPDATE_DELAY_MS)
        setCash(newCashValue)

        // 7) Wait for cash slot animation
        await sleep(SLOT_MS)
      }
    } finally {
      isProcessingRef.current = false
    }
  }, [cardStackRef, balanceUpdaters, pushNotification, setHolding])

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
