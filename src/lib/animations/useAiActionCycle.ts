'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { CardStackHandle } from '@/components/CardStack'
import { useNotificationStore } from '@/store/notifications'
import { usePortfolioStore } from '@/store/portfolio'
import { computePostTrade, deriveHealth, type HoldingsZAR } from '@/lib/portfolio/applyTrade'
import { enforceAllocations } from '@/lib/portfolio/calculateMetrics'

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
      // Note: wallet alloc stores everything in ZAR cents, so getCash/Eth/Pepe return ZAR
      const prev: HoldingsZAR = {
        CASH: cashHolding?.amountZAR ?? getCash(), // getCash() returns ZAR
        ETH: ethHolding?.amountZAR ?? getEth(), // getEth() returns ZAR (not USDT)
        PEPE: pepeHolding?.amountZAR ?? getPepe(), // getPepe() returns ZAR (not USDT)
      }

      // Get USDT balances for logic (from wallet alloc, convert ZAR to USDT)
      const eth = getEth() / FX_USD_ZAR_DEFAULT
      const pepe = getPepe() / FX_USD_ZAR_DEFAULT
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
        const { next: rawNext, total: rawTotal, alloc: rawAlloc } = computePostTrade(prev, trade)

        // Enforce allocation rules: Cash ≥ 90%, ETH + PEPE ≤ 10%
        // Use the total from prev (should be constant at 6103.00)
        // This ensures we maintain the exact total across all trades
        const totalZAR = prev.CASH + prev.ETH + prev.PEPE
        const enforced = enforceAllocations(rawNext, totalZAR)

        // Recompute allocations and total after enforcement
        const finalTotal = enforced.CASH + enforced.ETH + enforced.PEPE
        const finalAlloc: HoldingsZAR = {
          CASH: (enforced.CASH / finalTotal) * 100,
          ETH: (enforced.ETH / finalTotal) * 100,
          PEPE: (enforced.PEPE / finalTotal) * 100,
        }

        // Dev aid: log allocation percentages for verification
        console.log('[alloc]', {
          cashPct: finalAlloc.CASH.toFixed(2),
          ethPct: finalAlloc.ETH.toFixed(2),
          pepePct: finalAlloc.PEPE.toFixed(2),
          sumPct: (finalAlloc.CASH + finalAlloc.ETH + finalAlloc.PEPE).toFixed(2),
          totalZAR: finalTotal.toFixed(2),
        })

        // 1) Flip forward to target
        await cardStackRef.current.flipToCard(targetType, 'forward')
        await sleep(FLIP_MS + 50)

        // 2) Update ALL holdings in portfolio store with enforced values and same totalZAR
        // This triggers health/allocation tweens at t=0ms
        setHolding({
          symbol: 'CASH',
          amountZAR: enforced.CASH,
          amountUSDT: enforced.CASH / FX_USD_ZAR_DEFAULT,
          allocationPct: Math.round(finalAlloc.CASH * 100) / 100,
          health: deriveHealth('CASH', enforced, finalTotal),
        })

        setHolding({
          symbol: 'ETH',
          amountZAR: enforced.ETH,
          amountUSDT: enforced.ETH / FX_USD_ZAR_DEFAULT,
          allocationPct: Math.round(finalAlloc.ETH * 100) / 100,
          health: deriveHealth('ETH', enforced, finalTotal),
        })

        setHolding({
          symbol: 'PEPE',
          amountZAR: enforced.PEPE,
          amountUSDT: enforced.PEPE / FX_USD_ZAR_DEFAULT,
          allocationPct: Math.round(finalAlloc.PEPE * 100) / 100,
          health: deriveHealth('PEPE', enforced, finalTotal),
        })

        // 3) Update wallet allocation (for slot counter animations)
        // Use enforced values
        const newTarget = enforced[targetSymbol] / FX_USD_ZAR_DEFAULT
        const newCashValue = enforced.CASH / FX_USD_ZAR_DEFAULT

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
