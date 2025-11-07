'use client'

import TopGlassBar from '@/components/TopGlassBar'
import BottomGlassBar from '@/components/BottomGlassBar'

export default function ProfilePage() {
  return (
    <div className="app-shell">
      <div className="mobile-frame">
        <div className="dashboard-container">
          <TopGlassBar />

          {/* No content yet — glass bars only */}

          <BottomGlassBar />
        </div>
      </div>
    </div>
  )
}

