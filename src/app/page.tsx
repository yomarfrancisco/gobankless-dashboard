'use client'

import Image from 'next/image'
import CardStack from '@/components/CardStack'

export default function Home() {
  return (
    <div className="app-shell">
      <div className="mobile-frame">
        <div className="dashboard-container">
          {/* Page Title with Broken Glass */}
          <div className="page-title-gobankless">
            <Image
              src="/assets/glass-top-1.png"
              alt=""
              className="glass-shard-small"
              width={729}
              height={713}
              priority
              unoptimized
            />
            {/* Note: spraypaint-2.png is missing, uncomment when available */}
            {/* <Image
              src="/assets/spraypaint-2.png"
              alt=""
              className="spraypaint-effect"
              width={300}
              height={120}
              priority
              unoptimized
            /> */}
            <Image
              src="/assets/gobankless-logo.png"
              alt="GoBankless"
              className="gobankless-logo"
              width={220}
              height={65}
              priority
              unoptimized
            />
            <div className="icons">
              <div className="icon-group">
                <Image
                  src="/assets/scan.svg"
                  alt="Scan"
                  className="icon"
                  width={24}
                  height={24}
                />
                <Image
                  src="/assets/export.svg"
                  alt="Share"
                  className="icon"
                  width={24}
                  height={24}
                />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="content">
            <div className="card-switch">
              <div className="frame-parent">
                <div className="wallet-header">
                  <h1 className="wallet-title">Wallet</h1>
                  <div className="help-icon">?</div>
                </div>
                <p className="wallet-subtitle">Your digital cash card</p>
              </div>

              {/* Card Stack */}
              <CardStack />
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="btn btn-deposit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
                Deposit
              </button>
              <button className="btn btn-withdraw">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 7L7 17" />
                  <path d="M17 17H7V7" />
                </svg>
                Withdraw
              </button>
            </div>
          </div>

          {/* Bottom Menu with Glass Texture */}
          <div className="bottom-menu">
            <div className="bottom-menu-container">
              <Image
                src="/assets/glass-bottom-1.png"
                alt=""
                className="bottom-glass-texture"
                width={700}
                height={600}
                unoptimized
              />
              <div className="nav-container">
                <div className="nav-item">
                  <Image
                    src="/assets/home.svg"
                    alt="Home"
                    className="nav-icon"
                    width={28}
                    height={28}
                  />
                </div>
                <div className="dollar-sign-container">
                  <div className="dollar-sign-contained">
                    <Image
                      src="/assets/dollar-sign.png"
                      alt="Direct Payment"
                      width={40}
                      height={40}
                      unoptimized
                    />
                  </div>
                  <div className="nav-label">Direct payment</div>
                </div>
                <div className="nav-item">
                  <Image
                    src="/assets/user-outlined.svg"
                    alt="Profile"
                    className="nav-icon"
                    width={28}
                    height={28}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
