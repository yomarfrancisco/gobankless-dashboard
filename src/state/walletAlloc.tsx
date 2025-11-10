'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type WalletAlloc = {
  totalCents: number // total funds in cents; funds-available display derives from this
  cashCents: number
  ethCents: number
  pepeCents: number
}

type AllocState = {
  alloc: WalletAlloc
  // during a sequence, disable ambient flips
  isRebalancing: boolean
}

interface WalletAllocContextType {
  alloc: WalletAlloc
  isRebalancing: boolean
  setRebalancing: (value: boolean) => void
  applyAiAction: (action: { from: 'cash' | 'eth' | 'pepe'; to: 'cash' | 'eth' | 'pepe'; cents: number }) => void
  allocPct: (value: number) => number
}

const WalletAllocContext = createContext<WalletAllocContextType | undefined>(undefined)

const initial: WalletAlloc = {
  totalCents: 610300, // R6,103.00
  cashCents: 549270, // 90% of total
  ethCents: 18309, // 3% of total
  pepeCents: 42721, // 7% of total
}

export function WalletAllocProvider({ children }: { children: ReactNode }) {
  const [alloc, setAlloc] = useState<WalletAlloc>(initial)
  const [isRebalancing, setRebalancing] = useState(false)

  const applyAiAction = useCallback(
    (action: { from: 'cash' | 'eth' | 'pepe'; to: 'cash' | 'eth' | 'pepe'; cents: number }) => {
      setAlloc((prev) => {
        const fromKey = `${action.from}Cents` as keyof WalletAlloc
        const toKey = `${action.to}Cents` as keyof WalletAlloc

        const fromValue = prev[fromKey] as number
        const toValue = prev[toKey] as number

        // Clamp: from >= 0, to <= total
        const transferCents = Math.min(action.cents, fromValue)
        const newFromValue = Math.max(0, fromValue - transferCents)
        const newToValue = Math.min(prev.totalCents, toValue + transferCents)

        return {
          ...prev,
          [fromKey]: newFromValue,
          [toKey]: newToValue,
          // totalCents stays constant
        }
      })
    },
    []
  )

  const allocPct = useCallback(
    (value: number) => {
      return Math.round((10000 * value) / alloc.totalCents) / 100 // 2-dp % for display
    },
    [alloc.totalCents]
  )

  return (
    <WalletAllocContext.Provider value={{ alloc, isRebalancing, setRebalancing, applyAiAction, allocPct }}>
      {children}
    </WalletAllocContext.Provider>
  )
}

export function useWalletAlloc() {
  const context = useContext(WalletAllocContext)
  if (context === undefined) {
    throw new Error('useWalletAlloc must be used within WalletAllocProvider')
  }
  return context
}

