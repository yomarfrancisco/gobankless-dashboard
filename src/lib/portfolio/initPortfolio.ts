/**
 * Initialize portfolio store from wallet allocation
 * Called on app mount to sync initial state
 */

import { usePortfolioStore } from '@/store/portfolio'
import { updatePortfolioHolding } from './calculateMetrics'

const FX_USD_ZAR_DEFAULT = 18.1

export function initPortfolioFromAlloc(
  cashCents: number,
  ethCents: number,
  pepeCents: number,
  totalCents: number
) {
  const setHolding = usePortfolioStore.getState().setHolding
  const cashZAR = cashCents / 100
  const ethZAR = ethCents / 100
  const pepeZAR = pepeCents / 100
  const totalZAR = totalCents / 100

  // Initialize all holdings
  setHolding(updatePortfolioHolding('CASH', cashZAR, totalZAR, 100))
  setHolding(updatePortfolioHolding('ETH', ethZAR, totalZAR, 60))
  setHolding(updatePortfolioHolding('PEPE', pepeZAR, totalZAR, 25))
}

