'use client'

import { useState } from 'react'
import CardStack from '@/components/CardStack'
import TopGlassBar from '@/components/TopGlassBar'
import BottomGlassBar from '@/components/BottomGlassBar'

export default function Home() {
  const [topCardType, setTopCardType] = useState<'pepe' | 'savings' | 'yield'>('pepe')

  return (
    <div className="app-shell">
      <div className="mobile-frame">
        <div className="dashboard-container">
          <TopGlassBar />

          {/* Content Area */}
          <div className="content">
            <div className="card-switch">
              <div className="frame-parent">
                <div className="wallet-header">
                  <h1 className="wallet-title">Wallet</h1>
                  <div className="help-icon">?</div>
                </div>
                <p className="wallet-subtitle">
                  {topCardType === 'pepe' 
                    ? '$PEPE stablecoin' 
                    : topCardType === 'savings' 
                    ? 'ZAR stablecoin' 
                    : 'ETH stablecoin'}
                </p>
              </div>

              {/* Card Stack */}
              <CardStack onTopCardChange={setTopCardType} />
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

          <BottomGlassBar currentPath="/" />
        </div>
      </div>
    </div>
  )
}
