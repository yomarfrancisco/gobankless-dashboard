'use client'

import { useState, useCallback } from 'react'
import CardStack from '@/components/CardStack'
import TopGlassBar from '@/components/TopGlassBar'
import BottomGlassBar from '@/components/BottomGlassBar'
import DepositSheet from '@/components/DepositSheet'
import WithdrawSheet from '@/components/WithdrawSheet'
import AmountSheet from '@/components/AmountSheet'
import DirectPaymentSheet from '@/components/DirectPaymentSheet'

export default function Home() {
  const [topCardType, setTopCardType] = useState<'pepe' | 'savings' | 'yield'>('savings')
  const [openDeposit, setOpenDeposit] = useState(false)
  const [openWithdraw, setOpenWithdraw] = useState(false)
  const [openAmount, setOpenAmount] = useState(false)
  const [openDirectPayment, setOpenDirectPayment] = useState(false)
  const [amountMode, setAmountMode] = useState<'deposit' | 'withdraw' | 'send'>('deposit')

  const openDepositSheet = useCallback(() => setOpenDeposit(true), [])
  const openDirectPaymentSheet = useCallback(() => setOpenDirectPayment(true), [])
  const closeDirectPayment = useCallback(() => setOpenDirectPayment(false), [])
  const openWithdrawSheet = useCallback(() => setOpenWithdraw(true), [])
  const closeDeposit = useCallback(() => setOpenDeposit(false), [])
  const closeWithdraw = useCallback(() => setOpenWithdraw(false), [])
  const closeAmount = useCallback(() => setOpenAmount(false), [])

  return (
    <div className="app-shell">
      <div className="mobile-frame">
        <div className="dashboard-container">
          {/* Overlay: Glass bars only */}
          <div className="overlay-glass">
            <TopGlassBar />
            <BottomGlassBar currentPath="/" onDollarClick={openDirectPaymentSheet} />
          </div>

          {/* Scrollable content */}
          <div className="scroll-content">
            <div className="content">
              <div className="card-switch">
                <div className="frame-parent">
                  <div className="wallet-header">
                    <h1 className="wallet-title">Stablecoin wallet</h1>
                    <div className="help-icon">?</div>
                  </div>
                  <p className="wallet-subtitle">
                    {topCardType === 'pepe' 
                      ? 'PEPE stablecoin' 
                      : topCardType === 'savings' 
                      ? 'BRICS Stablecoin' 
                      : 'ETH stablecoin'}
                  </p>
                </div>

                {/* Card Stack */}
                <CardStack onTopCardChange={setTopCardType} />
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="btn btn-deposit" onClick={openDepositSheet} onTouchStart={openDepositSheet}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                  Deposit
                </button>
                <button className="btn btn-withdraw" onClick={openWithdrawSheet} onTouchStart={openWithdrawSheet}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 7L7 17" />
                    <path d="M17 17H7V7" />
                  </svg>
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sheets */}
      <DirectPaymentSheet
        open={openDirectPayment}
        onClose={closeDirectPayment}
        onSelect={(method) => {
          setOpenDirectPayment(false)
          console.log('Direct payment method selected', method)
        }}
      />
      <DepositSheet
        open={openDeposit}
        onClose={closeDeposit}
        onSelect={(method) => {
          setOpenDeposit(false)
          setAmountMode('deposit')
          setTimeout(() => setOpenAmount(true), 220)
        }}
      />
      <WithdrawSheet
        open={openWithdraw}
        onClose={closeWithdraw}
        onSelect={(method) => {
          setOpenWithdraw(false)
          setAmountMode('withdraw')
          setTimeout(() => setOpenAmount(true), 220)
        }}
      />
      <AmountSheet
        open={openAmount}
        onClose={closeAmount}
        mode={amountMode}
        balanceZAR={200}
        fxRateZARperUSDT={18.1}
        ctaLabel={amountMode === 'deposit' ? 'Transfer USDT' : 'Continue'}
        onSubmit={({ amountZAR, amountUSDT }) => {
          setOpenAmount(false)
          console.log('Amount chosen', { amountZAR, amountUSDT, mode: amountMode })
        }}
      />
    </div>
  )
}
