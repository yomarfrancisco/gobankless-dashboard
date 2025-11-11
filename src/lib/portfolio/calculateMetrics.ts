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

/**
 * Enforce allocation rules: Cash ≥ 90%, ETH + PEPE ≤ 10%
 * Returns ZAR amounts that sum exactly to totalZAR
 * This enforces share allocation percentages, not health
 */
export function enforceAllocations(
  inputZAR: { CASH: number; ETH: number; PEPE: number },
  totalZAR: number
): { CASH: number; ETH: number; PEPE: number } {
  // 1) Clamp raw to non-negatives
  let cashZAR = Math.max(0, inputZAR.CASH)
  let ethZAR = Math.max(0, inputZAR.ETH)
  let pepeZAR = Math.max(0, inputZAR.PEPE)

  // 2) Compute raw percentages
  const rawTotal = cashZAR + ethZAR + pepeZAR
  if (rawTotal === 0) {
    // Edge case: all zero, set to 100% cash
    return { CASH: totalZAR, ETH: 0, PEPE: 0 }
  }

  const rawEthPct = ethZAR / rawTotal
  const rawPepePct = pepeZAR / rawTotal
  const rawNonCashPct = rawEthPct + rawPepePct

  // 3) Scale ETH+PEPE together so (ETH+PEPE) = min(10%, raw ETH+PEPE) while preserving their ratio
  const targetNonCashPct = Math.min(0.10, rawNonCashPct)
  const targetCashPct = 1.0 - targetNonCashPct

  // 4) Set Cash = total - (ETH+PEPE)
  const remainingZAR = totalZAR * targetNonCashPct
  cashZAR = totalZAR * targetCashPct

  // 5) Preserve ETH/PEPE ratio within the non-cash allocation
  const nonCashTotal = ethZAR + pepeZAR
  if (nonCashTotal > 0) {
    ethZAR = (ethZAR / nonCashTotal) * remainingZAR
    pepeZAR = (pepeZAR / nonCashTotal) * remainingZAR
  } else {
    // If both are zero, split evenly
    ethZAR = remainingZAR * 0.5
    pepeZAR = remainingZAR * 0.5
  }

  // 6) Fix rounding drift on CASH to ensure exact total
  const actualTotal = cashZAR + ethZAR + pepeZAR
  const drift = totalZAR - actualTotal
  cashZAR += drift

  return {
    CASH: Math.max(0, cashZAR),
    ETH: Math.max(0, ethZAR),
    PEPE: Math.max(0, pepeZAR),
  }
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

