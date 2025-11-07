'use client'

import TopGlassBar from '@/components/TopGlassBar'
import BottomGlassBar from '@/components/BottomGlassBar'
import ProfileDark from '@/components/ProfileDark'

export default function ProfilePage() {
  return (
    <div className="app-shell">
      <div className="mobile-frame">
        <div className="dashboard-container">
          <TopGlassBar />

          {/* Content Area */}
          <div className="content">
            <ProfileDark />
          </div>

          <BottomGlassBar />
        </div>
      </div>
    </div>
  )
}

