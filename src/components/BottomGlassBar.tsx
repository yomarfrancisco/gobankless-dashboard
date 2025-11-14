'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useWalletMode } from '@/state/walletMode'
import { useTransactSheet } from '@/store/useTransactSheet'
import '@/styles/bottom-glass.css'

interface BottomGlassBarProps {
  currentPath?: string
  onDollarClick?: () => void // Keep for backward compatibility, but will use store if not provided
}

export default function BottomGlassBar({ currentPath = '/', onDollarClick }: BottomGlassBarProps) {
  const { open } = useTransactSheet()
  
  const handleDollarClick = onDollarClick ?? (() => open())
  const isHome = currentPath === '/'
  const isProfile = currentPath === '/profile' || currentPath === '/transactions' || currentPath === '/activity'
  const { mode } = useWalletMode()

  return (
    <div className="bottom-menu">
      <div className="bottom-menu-container">
        <div className="bottom-glass-wrapper">
          <Image
            src="/assets/core/glass-bottom-1.png"
            alt=""
            className="bottom-glass-texture"
            width={700}
            height={600}
            unoptimized
          />
        </div>
        <div className="nav-container">
          <div className="nav-item">
            <Link href="/" aria-label="Home">
              <Image 
                src="/assets/nav/home.svg" 
                alt="Home" 
                className={`nav-icon ${isHome ? 'nav-icon-active' : 'nav-icon-dim'}`} 
                width={28} 
                height={28} 
              />
            </Link>
          </div>
          <div className="dollar-sign-container">
            <button
              className={`dollar-sign-contained fab-dollar ${mode === 'manual' ? 'is-manual' : 'is-autonomous'}`}
              aria-label={`Transact (${mode} mode)`}
              onClick={handleDollarClick}
              onTouchStart={handleDollarClick}
              type="button"
            >
              <Image src="/assets/core/dollar-sign.png" alt="Direct Payment" width={60} height={60} unoptimized />
            </button>
            <div className="nav-label">Direct payment</div>
          </div>
          <div className="nav-item">
            <Link href="/profile" aria-label="Profile">
              <Image 
                src="/assets/nav/user-outlined.svg" 
                alt="Profile" 
                className={`nav-icon ${isProfile ? 'nav-icon-active' : 'nav-icon-dim'}`} 
                width={28} 
                height={28} 
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

