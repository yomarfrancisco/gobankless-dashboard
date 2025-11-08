'use client'

import { useState, useCallback, useRef } from 'react'
import CardStack, { type CardStackHandle } from '@/components/CardStack'
import TopGlassBar from '@/components/TopGlassBar'
import BottomGlassBar from '@/components/BottomGlassBar'
import DepositSheet from '@/components/DepositSheet'
import WithdrawSheet from '@/components/WithdrawSheet'
import AmountSheet from '@/components/AmountSheet'
import SendDetailsSheet from '@/components/SendDetailsSheet'
import SuccessSheet from '@/components/SuccessSheet'
import BankTransferDetailsSheet from '@/components/BankTransferDetailsSheet'
import { formatUSDT } from '@/lib/money'
import { useRandomCardFlips } from '@/lib/animations/useRandomCardFlips'

export default function Home() {
  const [topCardType, setTopCardType] = useState<'pepe' | 'savings' | 'yield'>('savings')
  const cardStackRef = useRef<CardStackHandle>(null)
  const [openDeposit, setOpenDeposit] = useState(false)
  const [openWithdraw, setOpenWithdraw] = useState(false)
  const [openAmount, setOpenAmount] = useState(false)
  const [openDirectPayment, setOpenDirectPayment] = useState(false)
  const [openSendDetails, setOpenSendDetails] = useState(false)
  const [openSendSuccess, setOpenSendSuccess] = useState(false)
  const [openDepositSuccess, setOpenDepositSuccess] = useState(false)
  const [openBankTransferDetails, setOpenBankTransferDetails] = useState(false)
  const [amountMode, setAmountMode] = useState<'deposit' | 'withdraw' | 'send' | 'depositCard'>('deposit')
  const [sendAmountZAR, setSendAmountZAR] = useState(0)
  const [sendAmountUSDT, setSendAmountUSDT] = useState(0)
  const [sendRecipient, setSendRecipient] = useState('')
  const [sendMethod, setSendMethod] = useState<'email' | 'wallet' | 'brics' | null>(null)
  const [depositAmountZAR, setDepositAmountZAR] = useState(0)

  const openDepositSheet = useCallback(() => setOpenDeposit(true), [])
  const openDirectPaymentSheet = useCallback(() => setOpenDirectPayment(true), [])
  const closeDirectPayment = useCallback(() => setOpenDirectPayment(false), [])
  const openWithdrawSheet = useCallback(() => setOpenWithdraw(true), [])
  const closeDeposit = useCallback(() => setOpenDeposit(false), [])
  const closeWithdraw = useCallback(() => setOpenWithdraw(false), [])
  const closeAmount = useCallback(() => setOpenAmount(false), [])
  const closeSendDetails = useCallback(() => setOpenSendDetails(false), [])
  const closeSendSuccess = useCallback(() => {
    setOpenSendSuccess(false)
    setSendRecipient('')
    setSendAmountZAR(0)
    setSendAmountUSDT(0)
  }, [])
  const closeDepositSuccess = useCallback(() => {
    setOpenDepositSuccess(false)
    setDepositAmountZAR(0)
  }, [])
  const closeBankTransferDetails = useCallback(() => {
    setOpenBankTransferDetails(false)
  }, [])

  const handleDirectSelect = useCallback((method: 'bank' | 'card' | 'crypto' | 'email' | 'wallet' | 'brics') => {
    if (method === 'email' || method === 'wallet' || method === 'brics') {
      setAmountMode('send')
      setSendMethod(method)
      setOpenDirectPayment(false)
      setTimeout(() => setOpenAmount(true), 220)
    }
  }, [])

  const handleAmountSubmit = useCallback((amountZAR: number) => {
    if (amountMode === 'send') {
      setSendAmountZAR(amountZAR)
      // Calculate USDT amount (using same rate as AmountSheet: 18.1)
      const fxRateZARperUSDT = 18.1
      setSendAmountUSDT(amountZAR / fxRateZARperUSDT)
      setOpenAmount(false)
      
      setTimeout(() => setOpenSendDetails(true), 220)
    }
  }, [amountMode])

  // Random card flips (experimental, feature-flagged)
  const randomFlipsEnabled = process.env.NEXT_PUBLIC_ENABLE_RANDOM_CARD_FLIPS === '1'
  const randomFlipQuietMs = Number(process.env.NEXT_PUBLIC_RANDOM_FLIP_QUIET_MS ?? 10000)
  const randomFlipMinMs = Number(process.env.NEXT_PUBLIC_RANDOM_FLIP_MIN_MS ?? 1000)
  const randomFlipMaxMs = Number(process.env.NEXT_PUBLIC_RANDOM_FLIP_MAX_MS ?? 60000)
  const randomFlipMinCount = Number(process.env.NEXT_PUBLIC_RANDOM_FLIP_MIN_COUNT ?? 1)
  const randomFlipMaxCount = Number(process.env.NEXT_PUBLIC_RANDOM_FLIP_MAX_COUNT ?? 3)

  useRandomCardFlips({
    enabled: randomFlipsEnabled,
    quietMs: randomFlipQuietMs,
    minMs: randomFlipMinMs,
    maxMs: randomFlipMaxMs,
    minFlips: randomFlipMinCount,
    maxFlips: randomFlipMaxCount,
    flip: () => cardStackRef.current?.cycleNext(),
  })

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
                    <h1 className="wallet-title">Autonomous wallet</h1>
                    <div className="help-icon">?</div>
                  </div>
                  <p className="wallet-subtitle">
                    {topCardType === 'pepe' 
                      ? 'PEPE account' 
                      : topCardType === 'savings' 
                      ? 'Cash account' 
                      : 'ETH account'}
                  </p>
                </div>

                {/* Card Stack */}
                <CardStack ref={cardStackRef} onTopCardChange={setTopCardType} />
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
          if (method === 'bank') {
            setTimeout(() => setOpenBankTransferDetails(true), 220)
          } else if (method === 'card') {
            setAmountMode('depositCard')
            setTimeout(() => setOpenAmount(true), 220)
          } else {
            setAmountMode('deposit')
            setTimeout(() => setOpenAmount(true), 220)
          }
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
        ctaLabel={amountMode === 'depositCard' ? 'Deposit' : amountMode === 'deposit' ? 'Transfer USDT' : amountMode === 'send' ? 'Send' : 'Continue'}
        onSubmit={amountMode === 'depositCard' ? ({ amountZAR }) => {
          setDepositAmountZAR(amountZAR)
          setOpenAmount(false)
          setTimeout(() => setOpenDepositSuccess(true), 220)
        } : amountMode !== 'send' ? ({ amountZAR, amountUSDT }) => {
          setOpenAmount(false)
          console.log('Amount chosen', { amountZAR, amountUSDT, mode: amountMode })
        } : undefined}
        onAmountSubmit={amountMode === 'send' ? handleAmountSubmit : undefined}
      />
      <SendDetailsSheet
        open={openSendDetails}
        onClose={closeSendDetails}
        amountZAR={sendAmountZAR}
        amountUSDT={sendAmountUSDT}
        sendMethod={sendMethod}
        onPay={(payload) => {
          console.log('PAY', payload)
          setSendRecipient(payload.to)
          setOpenSendDetails(false)
          setTimeout(() => setOpenSendSuccess(true), 220)
        }}
      />
      <SuccessSheet
        open={openSendSuccess}
        onClose={closeSendSuccess}
        amountZAR={sendMethod === 'wallet' ? formatUSDT(sendAmountUSDT) : `R ${sendAmountZAR.toLocaleString('en-ZA', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`}
        recipient={sendRecipient}
        kind="send"
      />
      <SuccessSheet
        open={openDepositSuccess}
        onClose={closeDepositSuccess}
        amountZAR={`R ${depositAmountZAR.toLocaleString('en-ZA', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`}
        recipient=""
        kind="deposit"
      />
      <BankTransferDetailsSheet
        open={openBankTransferDetails}
        onClose={closeBankTransferDetails}
      />
    </div>
  )
}
