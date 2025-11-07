'use client'

import Image from 'next/image'
import Link from 'next/link'

interface BottomGlassBarProps {
  currentPath?: string
  onDollarClick?: () => void
}

export default function BottomGlassBar({ currentPath = '/', onDollarClick }: BottomGlassBarProps) {
  const isHome = currentPath === '/'
  const isProfile = currentPath === '/profile'

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
              className="dollar-sign-contained"
              aria-label="Direct payment"
              onClick={onDollarClick}
              type="button"
            >
              <Image src="/assets/core/dollar-sign.png" alt="Direct Payment" width={44} height={44} unoptimized />
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

