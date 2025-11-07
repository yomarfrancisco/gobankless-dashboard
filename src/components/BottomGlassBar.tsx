'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function BottomGlassBar() {
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
              <Image src="/assets/home.svg" alt="Home" className="nav-icon" width={28} height={28} />
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
              <Image src="/assets/user-outlined.svg" alt="Profile" className="nav-icon" width={28} height={28} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

