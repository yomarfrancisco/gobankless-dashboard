'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export type WalletMode = 'autonomous' | 'manual'

const STORAGE_KEY = 'gb.walletMode'

interface WalletModeContextType {
  mode: WalletMode
  setMode: (mode: WalletMode) => void
}

const WalletModeContext = createContext<WalletModeContextType | undefined>(undefined)

export function WalletModeProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage synchronously
  const [mode, setModeState] = useState<WalletMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored === 'manual' || stored === 'autonomous' ? stored : 'autonomous'
    }
    return 'autonomous'
  })

  // Update DOM dataset whenever mode changes (for CSS)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.dataset.walletMode = mode
    }
  }, [mode])

  // Persist to localStorage and update DOM dataset
  const setMode = useCallback((newMode: WalletMode) => {
    setModeState(newMode)
    try {
      localStorage.setItem(STORAGE_KEY, newMode)
      if (typeof window !== 'undefined') {
        document.documentElement.dataset.walletMode = newMode
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (e.newValue === 'autonomous' || e.newValue === 'manual') {
          setModeState(e.newValue)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <WalletModeContext.Provider value={{ mode, setMode }}>
      {children}
    </WalletModeContext.Provider>
  )
}

export function useWalletMode() {
  const context = useContext(WalletModeContext)
  if (context === undefined) {
    throw new Error('useWalletMode must be used within WalletModeProvider')
  }
  return context
}

