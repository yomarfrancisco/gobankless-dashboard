'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import TopGlassBar from '@/components/TopGlassBar'
import BottomGlassBar from '@/components/BottomGlassBar'
import DepositSheet from '@/components/DepositSheet'
import WithdrawSheet from '@/components/WithdrawSheet'
import AmountSheet from '@/components/AmountSheet'
import SendDetailsSheet from '@/components/SendDetailsSheet'
import SuccessSheet from '@/components/SuccessSheet'
import { formatUSDT } from '@/lib/money'
import AutonomyToggle from '@/components/AutonomyToggle'
import { useActivityStore } from '@/store/activity'
import { useTransactSheet } from '@/store/useTransactSheet'
import { useUserProfileStore } from '@/store/userProfile'
import { useProfileEditSheet } from '@/store/useProfileEditSheet'
import Avatar from '@/components/Avatar'

export default function ProfilePage() {
  const router = useRouter()
  const activityCount = useActivityStore((s) => s.items.length)
  const { setOnSelect, open } = useTransactSheet()
  const { profile } = useUserProfileStore()
  const { open: openProfileEdit } = useProfileEditSheet()
  const [openDeposit, setOpenDeposit] = useState(false)
  const [openWithdraw, setOpenWithdraw] = useState(false)
  const [openAmount, setOpenAmount] = useState(false)
  const [openDirectPayment, setOpenDirectPayment] = useState(false)
  const [openSendDetails, setOpenSendDetails] = useState(false)
  const [openSendSuccess, setOpenSendSuccess] = useState(false)
  const [amountMode, setAmountMode] = useState<'deposit' | 'withdraw' | 'send'>('deposit')
  const [sendAmountZAR, setSendAmountZAR] = useState(0)
  const [sendAmountUSDT, setSendAmountUSDT] = useState(0)
  const [sendRecipient, setSendRecipient] = useState('')
  const [sendMethod, setSendMethod] = useState<'email' | 'wallet' | 'brics' | null>(null)
  const [flowType, setFlowType] = useState<'payment' | 'transfer'>('payment')

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

  const handleDirectSelect = useCallback((method: 'bank' | 'card' | 'crypto' | 'email' | 'wallet' | 'brics') => {
    if (method === 'email' || method === 'wallet' || method === 'brics') {
      setAmountMode('send')
      setSendMethod(method)
      setOpenDirectPayment(false)
      setTimeout(() => setOpenAmount(true), 220)
    }
  }, [])

  const handleAmountSubmit = useCallback((amountZAR: number) => {
    if (amountMode === 'send' || flowType === 'transfer') {
      setSendAmountZAR(amountZAR)
      // Calculate USDT amount (using same rate as AmountSheet: 18.1)
      const fxRateZARperUSDT = 18.1
      setSendAmountUSDT(amountZAR / fxRateZARperUSDT)
      setOpenAmount(false)
      
      setTimeout(() => setOpenSendDetails(true), 220)
    }
  }, [amountMode, flowType])

  // Register onSelect handler for global Transact sheet
  useEffect(() => {
    setOnSelect((action) => {
      if (action === 'deposit') {
        setTimeout(() => setOpenDeposit(true), 220)
      } else if (action === 'withdraw') {
        setTimeout(() => setOpenWithdraw(true), 220)
      } else if (action === 'payment') {
        setFlowType('payment')
        setTimeout(() => setOpenDirectPayment(true), 220)
      } else if (action === 'transfer') {
        setFlowType('transfer')
        setAmountMode('send')
        setSendMethod('brics') // Use GoBankless Handle flow like payment
        setTimeout(() => setOpenAmount(true), 220)
      }
    })
    
    return () => {
      setOnSelect(null) // Cleanup on unmount
    }
  }, [setOnSelect])
  return (
    <div className="app-shell">
      <div className="mobile-frame">
        <div className="dashboard-container">
          {/* Overlay: Glass bars only */}
          <div className="overlay-glass">
            <TopGlassBar />
            <BottomGlassBar currentPath="/profile" onDollarClick={() => open()} />
          </div>

          {/* Scrollable content */}
          <div className="scroll-content">
            <div className="content" style={{ background: '#fff' }}>
              {/* Avatar + name + handle */}
              <div className="profile-header">
                <Avatar
                  name={profile.fullName}
                  email={profile.email}
                  size={96}
                  rounded={24}
                  className="profile-avatar"
                />
                <h1 className="profile-name">{profile.fullName || 'User'}</h1>
                <div className="profile-handle">{profile.handle}</div>

                {/* Autonomous mode toggle */}
                <div style={{ marginTop: 8, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                  <AutonomyToggle />
                </div>

                {/* Bio */}
                <p className="profile-bio">
                  A skilled entrepreneur experienced in manufacturing and construction across Africa.
                  Let&rsquo;s do business, DMs are open.
                </p>

                {/* Meta row */}
                <div className="profile-meta">
                  <div className="meta-item">
                    <Image src="/assets/profile/location-pin.svg" alt="" width={12} height={12} />
                    <span>South Africa</span>
                  </div>
                  <div className="meta-dot" />
                  <div className="meta-item">
                    <Image src="/assets/profile/calendar_month.svg" alt="" width={12} height={12} />
                    <span>Joined Feb 2024</span>
                  </div>
                </div>
              </div>

              {/* Stats + network pill */}
              <div className="profile-stats-card">
                <div className="stats-row">
                  <div className="stat">
                    <div className="stat-top">
                      <span className="stat-value">4.8</span>
                      <Image src="/assets/profile/star.svg" alt="" width={12} height={12} />
                    </div>
                    <div className="stat-sub">(11.5K)</div>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat">
                    <div className="stat-value">8,122</div>
                    <div className="stat-sub">Suppliers</div>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat">
                    <div className="stat-value">556</div>
                    <div className="stat-sub">Supplying</div>
                  </div>
                </div>
                <div className="network-pill">
                  <div className="network-track">
                    <div className="network-fill" />
                  </div>
                  <div className="network-label">Business network</div>
                </div>
              </div>

              {/* Social row */}
              <div className="profile-social">
                <Image src="/assets/profile/email_outlined.svg" alt="Email" width={20} height={20} />
                <Image src="/assets/profile/dot.svg" alt="" width={3} height={3} />
                <Image src="/assets/profile/instagram.svg" alt="Instagram" width={20} height={20} />
                <Image src="/assets/profile/dot.svg" alt="" width={3} height={3} />
                <Image src="/assets/profile/linkedin.svg" alt="LinkedIn" width={20} height={20} />
              </div>

              {/* Buttons */}
              <div className="profile-actions">
                <button className="btn profile-edit" onClick={openProfileEdit}>
                  Edit profile
                </button>
                <button
                  className={`btn profile-inbox ${activityCount === 0 ? 'disabled' : ''}`}
                  onClick={() => activityCount > 0 && router.push('/activity')}
                  disabled={activityCount === 0}
                  style={{ opacity: activityCount === 0 ? 0.5 : 1, cursor: activityCount === 0 ? 'not-allowed' : 'pointer' }}
                >
                  Transactions
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
        flowType={flowType}
        balanceZAR={200}
        fxRateZARperUSDT={18.1}
        ctaLabel={amountMode === 'deposit' ? 'Transfer USDT' : amountMode === 'send' ? (flowType === 'transfer' ? 'Transfer' : 'Send') : 'Continue'}
        onSubmit={amountMode !== 'send' ? ({ amountZAR, amountUSDT }) => {
          setOpenAmount(false)
          console.log('Amount chosen', { amountZAR, amountUSDT, mode: amountMode })
        } : undefined}
        onAmountSubmit={(amountMode === 'send' || flowType === 'transfer') ? handleAmountSubmit : undefined}
      />
      <SendDetailsSheet
        open={openSendDetails}
        onClose={closeSendDetails}
        amountZAR={sendAmountZAR}
        amountUSDT={sendAmountUSDT}
        sendMethod={sendMethod}
        flowType={flowType}
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
        flowType={flowType}
      />
    </div>
  )
}

