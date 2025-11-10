/**
 * Compute post-trade portfolio state from a trade
 * Single source of truth for deriving holdings after a trade
 */

import { calculateHealth } from './calculateMetrics'

export type HoldingsZAR = { CASH: number; ETH: number; PEPE: number }

export type Trade = {
  symbol: 'ETH' | 'PEPE'
  deltaZAR: number // +buy / -sell in ZAR terms
}

export type PostTradeState = {
  next: HoldingsZAR
  total: number
  alloc: HoldingsZAR
}

export function computePostTrade(prev: HoldingsZAR, trade: Trade): PostTradeState {
  const next: HoldingsZAR = { ...prev }

  // Move cash opposite to target delta
  next.CASH = Math.max(0, prev.CASH - trade.deltaZAR)
  next[trade.symbol] = Math.max(0, prev[trade.symbol] + trade.deltaZAR)

  // Calculate total (guard against zero)
  const total = Math.max(1e-6, next.CASH + next.ETH + next.PEPE)

  // Calculate allocation percentages
  const alloc: HoldingsZAR = {
    CASH: (next.CASH / total) * 100,
    ETH: (next.ETH / total) * 100,
    PEPE: (next.PEPE / total) * 100,
  }

  return { next, total, alloc }
}

/**
 * Derive health for a symbol based on post-trade holdings
 */
export function deriveHealth(
  symbol: 'CASH' | 'ETH' | 'PEPE',
  holdings: HoldingsZAR,
  total: number
): number {
  const baseHealth: Record<'CASH' | 'ETH' | 'PEPE', number> = {
    CASH: 100,
    ETH: 60,
    PEPE: 25,
  }

  return calculateHealth(holdings[symbol], total, baseHealth[symbol])
}

