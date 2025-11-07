'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import TopGlassBar from '@/components/TopGlassBar'
import BottomGlassBar from '@/components/BottomGlassBar'
import DepositSheet from '@/components/DepositSheet'
import WithdrawSheet from '@/components/WithdrawSheet'
import AmountSheet from '@/components/AmountSheet'

export default function ProfilePage() {
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
            <BottomGlassBar currentPath="/profile" onDollarClick={openDirectPaymentSheet} />
          </div>

          {/* Scrollable content */}
          <div className="scroll-content">
            <div className="content" style={{ background: '#fff' }}>
              {/* Avatar + name + handle */}
              <div className="profile-header">
                <Image
                  src="/assets/profile/headshot.png"
                  alt="Profile"
                  className="profile-avatar"
                  width={104}
                  height={104}
                  unoptimized
                />
                <h1 className="profile-name">Samuel Akoyo</h1>
                <div className="profile-handle">$samakoyo</div>

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
                <button className="btn profile-edit">Edit profile</button>
                <button className="btn profile-inbox">Inbox</button>
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
        onSelect={(method) => {
          if (method === 'email' || method === 'wallet' || method === 'brics') {
            setAmountMode('send')
            setOpenDirectPayment(false)
            setTimeout(() => setOpenAmount(true), 220)
          }
        }}
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
        onSubmit={({ amountZAR, amountUSDT }) => {
          setOpenAmount(false)
          console.log('Amount chosen', { amountZAR, amountUSDT, mode: amountMode })
        }}
      />
    </div>
  )
}

