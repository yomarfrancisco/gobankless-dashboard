export const formatZAR = (n: number) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 2,
  }).format(n)

export const formatUSDT = (n: number) => `USDT ${n.toFixed(2)}`

