'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function Home() {
  const [activeCard, setActiveCard] = useState('pepe')

  const handleCardClick = (cardType: string) => {
    setActiveCard(cardType)
  }

  const getCardZIndex = (cardType: string) => {
    if (activeCard === cardType) return 3
    // Default z-index based on card position
    if (cardType === 'pepe') return 1
    if (cardType === 'savings') return 2
    if (cardType === 'yield') return 1
    return 1
  }

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
              width={244}
              height={72}
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
              <div className="card-stack">
                <div
                  className={`card card-pepe ${activeCard === 'pepe' ? 'active' : ''}`}
                  onClick={() => handleCardClick('pepe')}
                  style={{ zIndex: getCardZIndex('pepe') }}
                >
                  <Image
                    src="/assets/card-pepe.jpg"
                    alt="PEPE Card"
                    width={398}
                    height={238}
                    unoptimized
                  />
                  <div className="card-content-overlay">
                    <div className="card-balance-section">
                      <div className="card-balance-amount">
                        R1,812<span className="card-balance-amount-decimal">.88</span>
                      </div>
                      <div className="card-balance-usdc">100 USDC</div>
                    </div>
                    <div className="card-yield-badge">
                      <span className="card-yield-percentage">138%</span>
                      <span className="card-yield-text">annual yield</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`card card-savings ${activeCard === 'savings' ? 'active' : ''}`}
                  onClick={() => handleCardClick('savings')}
                  style={{ zIndex: getCardZIndex('savings') }}
                >
                  <Image
                    src="/assets/card-savings.jpg"
                    alt="Savings Card"
                    width={342}
                    height={213}
                    unoptimized
                  />
                  <div className="card-content-overlay">
                    <div className="card-balance-section">
                      <div className="card-balance-amount">
                        5,678<span className="card-balance-amount-decimal">.90</span>
                      </div>
                      <div className="card-balance-usdc">USDC</div>
                    </div>
                  </div>
                </div>

                <div
                  className={`card card-yield ${activeCard === 'yield' ? 'active' : ''}`}
                  onClick={() => handleCardClick('yield')}
                  style={{ zIndex: getCardZIndex('yield') }}
                >
                  <Image
                    src="/assets/card-yield.jpg"
                    alt="Yield Card"
                    width={310}
                    height={193}
                    unoptimized
                  />
                  <div className="card-content-overlay">
                    <div className="card-balance-section">
                      <div className="card-balance-amount">
                        9,012<span className="card-balance-amount-decimal">.34</span>
                      </div>
                      <div className="card-balance-usdc">USDC</div>
                    </div>
                    <div className="card-yield-badge">
                      <span className="card-yield-percentage">4.2%</span>
                      <span className="card-yield-text">APY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="btn btn-deposit">Deposit</button>
              <button className="btn btn-withdraw">Withdraw</button>
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
                  <div className="nav-label">Home</div>
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
                  <div className="nav-label">Profile</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
