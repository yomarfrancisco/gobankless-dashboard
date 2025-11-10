'use client'

import { useEffect, useState, useCallback } from 'react'
import { getWalletMode, setWalletMode, type WalletMode } from '@/lib/state/userPrefs'

type Props = {
  className?: string
  onChange?: (mode: WalletMode) => void // future-friendly
}

export default function AutonomyToggle({ className, onChange }: Props) {
  const [mode, setMode] = useState<WalletMode>('autonomous')

  useEffect(() => {
    setMode(getWalletMode())
  }, [])

  const update = useCallback(
    (m: WalletMode) => {
      setMode(m)
      setWalletMode(m)
      onChange?.(m)
      
      // Dispatch custom event for same-tab updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('walletModeChange'))
      }

      if (process.env.NEXT_PUBLIC_DEV_PROFILE_TOGGLE_LOGS === '1') {
        console.log('[AutonomyToggle] mode:', m)
      }
    },
    [onChange]
  )

  // a11y: tablist + tabs, arrow keys + space/enter
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      update(mode === 'autonomous' ? 'manual' : 'autonomous')
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Wallet Control Mode"
      className={`autonomy-toggle ${className || ''}`}
      tabIndex={0}
      onKeyDown={onKey}
    >
      <button
        role="tab"
        aria-selected={mode === 'autonomous'}
        className={`seg ${mode === 'autonomous' ? 'seg--active' : ''}`}
        onClick={() => update('autonomous')}
      >
        Autonomous
      </button>
      <button
        role="tab"
        aria-selected={mode === 'manual'}
        className={`seg ${mode === 'manual' ? 'seg--active' : ''}`}
        onClick={() => update('manual')}
      >
        Manual
      </button>
    </div>
  )
}

