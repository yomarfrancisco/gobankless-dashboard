'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useWalletMode } from '@/state/walletMode'
import { useTransactSheet } from '@/store/useTransactSheet'
import { ChatbotSheet } from './ChatbotSheet'
import '@/styles/bottom-glass.css'

interface BottomGlassBarProps {
  currentPath?: string
  onDollarClick?: () => void // Keep for backward compatibility, but will use store if not provided
}

export default function BottomGlassBar({ currentPath = '/', onDollarClick }: BottomGlassBarProps) {
  const { open } = useTransactSheet()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const isHome = currentPath === '/'
  const isProfile = currentPath === '/profile' || currentPath === '/transactions' || currentPath === '/activity'
  const { mode } = useWalletMode()
  const isAutonomousMode = mode === 'autonomous'
  
  const handleCenterButtonClick = () => {
    if (isAutonomousMode) {
      setIsChatOpen(true)
    } else {
      const handler = onDollarClick ?? (() => open())
      handler()
    }
  }

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
              aria-label={isAutonomousMode ? 'Open BRICS chat' : `Transact (${mode} mode)`}
              onClick={handleCenterButtonClick}
              onTouchStart={handleCenterButtonClick}
              type="button"
            >
              {isAutonomousMode ? (
                <Image 
                  src="/assets/Brics-girl-blue.png" 
                  alt="$BRICS Diamond" 
                  width={60} 
                  height={60} 
                  className="chat-avatar-image"
                  unoptimized 
                />
              ) : (
                <Image src="/assets/core/dollar-sign.png" alt="Direct Payment" width={60} height={60} unoptimized />
              )}
            </button>
            <div className="nav-label">{isAutonomousMode ? 'BRICS chat' : 'Direct payment'}</div>
          </div>
          <ChatbotSheet open={isChatOpen} onClose={() => setIsChatOpen(false)} />
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

