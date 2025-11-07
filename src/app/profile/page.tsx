'use client'

import { useState } from 'react'
import Image from 'next/image'
import TopGlassBar from '@/components/TopGlassBar'
import BottomGlassBar from '@/components/BottomGlassBar'
import DepositSheet from '@/components/DepositSheet'

export default function ProfilePage() {
  const [depositOpen, setDepositOpen] = useState(false)

  return (
    <div className="app-shell">
      <div className="mobile-frame">
        <div className="dashboard-container">
          <TopGlassBar />

          {/* Content Area */}
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

          <BottomGlassBar currentPath="/profile" onDollarClick={() => setDepositOpen(true)} />
        </div>
      </div>

      <DepositSheet isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
    </div>
  )
}

