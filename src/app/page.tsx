'use client'

import { useState, useCallback } from 'react'
import CardStack from '@/components/CardStack'
import TopGlassBar from '@/components/TopGlassBar'
import BottomGlassBar from '@/components/BottomGlassBar'
import DepositSheet from '@/components/DepositSheet'
import WithdrawSheet from '@/components/WithdrawSheet'
import AmountSheet from '@/components/AmountSheet'
import SendDetailsSheet from '@/components/SendDetailsSheet'

export default function Home() {
  const [topCardType, setTopCardType] = useState<'pepe' | 'savings' | 'yield'>('savings')
  const [openDeposit, setOpenDeposit] = useState(false)
  const [openWithdraw, setOpenWithdraw] = useState(false)
  const [openAmount, setOpenAmount] = useState(false)
  const [openDirectPayment, setOpenDirectPayment] = useState(false)
  const [openSendDetails, setOpenSendDetails] = useState(false)
  const [shouldAutoFocusSend, setShouldAutoFocusSend] = useState(false)
  const [amountMode, setAmountMode] = useState<'deposit' | 'withdraw' | 'send'>('deposit')
  const [sendAmountZAR, setSendAmountZAR] = useState(0)

  const openDepositSheet = useCallback(() => setOpenDeposit(true), [])
  const openDirectPaymentSheet = useCallback(() => setOpenDirectPayment(true), [])
  const closeDirectPayment = useCallback(() => setOpenDirectPayment(false), [])
  const openWithdrawSheet = useCallback(() => setOpenWithdraw(true), [])
  const closeDeposit = useCallback(() => setOpenDeposit(false), [])
  const closeWithdraw = useCallback(() => setOpenWithdraw(false), [])
  const closeAmount = useCallback(() => setOpenAmount(false), [])
  const closeSendDetails = useCallback(() => setOpenSendDetails(false), [])

  const handleDirectSelect = useCallback((method: 'bank' | 'card' | 'crypto' | 'email' | 'wallet' | 'brics') => {
    if (method === 'email' || method === 'wallet' || method === 'brics') {
      setAmountMode('send')
      setOpenDirectPayment(false)
      setTimeout(() => setOpenAmount(true), 220)
    }
  }, [])

  const handleAmountSubmit = useCallback((amountZAR: number) => {
    if (amountMode === 'send') {
      setSendAmountZAR(amountZAR)
      setOpenAmount(false)
      
      // iOS: Focus shim synchronously during the same tap to preserve user gesture context
      const isIOS = typeof navigator !== 'undefined' &&
        (/iP(ad|hone|od)/.test(navigator.platform) ||
          (navigator.userAgent.includes('Mac') && 'ontouchend' in document))
      
      if (isIOS) {
        const shim = document.getElementById('ios-keyboard-shim') as HTMLInputElement | null
        shim?.focus()
      }
      
      // Arm autofocus and open sheet
      setShouldAutoFocusSend(true)
      setTimeout(() => setOpenSendDetails(true), 220)
    }
  }, [amountMode])

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
      <DepositSheet
        open={openDirectPayment}
        onClose={closeDirectPayment}
        variant="direct-payment"
        onSelect={handleDirectSelect}
      />
      <DepositSheet
        open={openDeposit}
        onClose={closeDeposit}
        variant="deposit"
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
        ctaLabel={amountMode === 'deposit' ? 'Transfer USDT' : amountMode === 'send' ? 'Send' : 'Continue'}
        onSubmit={amountMode !== 'send' ? ({ amountZAR, amountUSDT }) => {
          setOpenAmount(false)
          console.log('Amount chosen', { amountZAR, amountUSDT, mode: amountMode })
        } : undefined}
        onAmountSubmit={amountMode === 'send' ? handleAmountSubmit : undefined}
      />
      <SendDetailsSheet
        open={openSendDetails}
        onClose={closeSendDetails}
        amountZAR={sendAmountZAR}
        autoFocusOnMount={shouldAutoFocusSend}
        onAfterAutoFocus={() => setShouldAutoFocusSend(false)}
        onPay={(payload) => {
          console.log('PAY', payload)
          setOpenSendDetails(false)
        }}
      />
    </div>
  )
}
