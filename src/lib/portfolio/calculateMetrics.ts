/**
 * Calculate portfolio metrics (allocation %, health) from amounts
 */

const FX_USD_ZAR_DEFAULT = 18.1

export function calculateAllocationPct(amountZAR: number, totalZAR: number): number {
  if (totalZAR === 0) return 0
  return Math.round((10000 * amountZAR) / totalZAR) / 100
}

export function calculateHealth(amountZAR: number, totalZAR: number, baseHealth: number): number {
  // Health is a function of allocation % relative to base
  // For now, use a simple linear mapping based on allocation
  const allocationPct = calculateAllocationPct(amountZAR, totalZAR)
  // Health decreases as allocation increases (more risk)
  // This is a simplified model - adjust as needed
  const healthFactor = Math.max(0, Math.min(100, baseHealth - (allocationPct - 10) * 2))
  return Math.round(healthFactor * 10) / 10
}

export function updatePortfolioHolding(
  symbol: 'CASH' | 'ETH' | 'PEPE',
  amountZAR: number,
  totalZAR: number,
  baseHealth: number
) {
  return {
    symbol,
    amountZAR,
    amountUSDT: amountZAR / FX_USD_ZAR_DEFAULT,
    allocationPct: calculateAllocationPct(amountZAR, totalZAR),
    health: calculateHealth(amountZAR, totalZAR, baseHealth),
  }
}

