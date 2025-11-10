/**
 * Currency formatting utilities
 * - Dot decimals (not comma)
 * - Thin spaces (U+2009) for thousands grouping
 * - No commas
 */

export function formatZAR(amount: number): { major: string; cents: string } {
  // Dot decimal; thin space for thousands; exactly two decimals.
  const abs = Math.abs(amount)
  const fixed = abs.toFixed(2) // "5492.70"
  const [intPart, decPart] = fixed.split('.')
  
  // Group with thin spaces (U+2009)
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009')
  
  return { major: grouped, cents: decPart }
}

export function formatUSDT(units: number): string {
  // No decimals for display unless we ever specify otherwise.
  // Round to nearest integer
  const rounded = Math.round(units)
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009')
}

