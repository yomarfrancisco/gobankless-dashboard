'use client'

import Image from 'next/image'
import Link from 'next/link'

interface BottomGlassBarProps {
  currentPath?: string
}

export default function BottomGlassBar({ currentPath = '/' }: BottomGlassBarProps) {
  const isHome = currentPath === '/'
  const isProfile = currentPath === '/profile'

  return (
    <div className="bottom-menu">
      <div className="bottom-menu-container">
        <div className="bottom-glass-wrapper">
          <Image
            src="/assets/glass-bottom-1.png"
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
                src="/assets/home.svg" 
                alt="Home" 
                className={`nav-icon ${isHome ? 'nav-icon-active' : 'nav-icon-dim'}`} 
                width={28} 
                height={28} 
              />
            </Link>
          </div>
          <div className="dollar-sign-container">
            <div className="dollar-sign-contained" aria-label="Direct payment">
              <Image src="/assets/dollar-sign.png" alt="Direct Payment" width={44} height={44} unoptimized />
            </div>
            <div className="nav-label">Direct payment</div>
          </div>
          <div className="nav-item">
            <Link href="/profile" aria-label="Profile">
              <Image 
                src="/assets/user-outlined.svg" 
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

