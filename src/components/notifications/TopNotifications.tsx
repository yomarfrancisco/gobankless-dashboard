'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useNotificationStore, type NotificationItem, getNotificationDetail } from '@/store/notifications'
import { formatRelativeShort } from '@/lib/formatRelativeTime'
import '@/styles/notifications.css'

const MAX_VISIBLE = 2
const AUTO_DISMISS_MS = 3000

// GoB pink logo avatar path (use the provided image)
const GOB_AVATAR_PATH = '/assets/aa2b32f2dc3e3a159949cb59284abddef5683b05.png'

export default function TopNotifications() {
  const router = useRouter()
  const { notifications, dismissNotification } = useNotificationStore()
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set())

  // Show notifications up to MAX_VISIBLE
  useEffect(() => {
    const visible = notifications.slice(0, MAX_VISIBLE)
    setVisibleIds(new Set(visible.map((n) => n.id)))

    // Auto-dismiss after delay
    visible.forEach((notification) => {
      const timer = setTimeout(() => {
        dismissNotification(notification.id)
        setVisibleIds((prev) => {
          const next = new Set(prev)
          next.delete(notification.id)
          return next
        })
      }, AUTO_DISMISS_MS)

      return () => clearTimeout(timer)
    })
  }, [notifications, dismissNotification])

  const handleTap = (notification: NotificationItem) => {
    if (notification.routeOnTap) {
      router.push(notification.routeOnTap)
    } else {
      router.push('/transactions')
    }
    dismissNotification(notification.id)
  }

  // Dismiss handler removed - notifications auto-dismiss after 3s or on tap

  // Haptic feedback (if available)
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10) // Light impact
    }
  }

  const visibleNotifications = notifications.filter((n) => visibleIds.has(n.id))

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div className="notifications-container" role="status" aria-live="polite" aria-atomic="false">
      {visibleNotifications.map((notification, index) => {
        const avatarUrl =
          notification.actor?.type === 'ai'
            ? GOB_AVATAR_PATH
            : notification.actor?.avatarUrl || GOB_AVATAR_PATH

        return (
          <div
            key={notification.id}
            className="notification-item"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
            onClick={() => {
              triggerHaptic()
              handleTap(notification)
            }}
            onAnimationStart={() => {
              if (index === 0) {
                triggerHaptic()
              }
            }}
          >
            <div className="notification-avatar">
              <Image
                src={avatarUrl}
                alt={notification.actor?.type === 'ai' ? 'AI' : 'User'}
                width={38}
                height={38}
                className="notification-avatar-img"
                unoptimized
              />
            </div>
            <div className="notification-content">
              <div className="notification-head">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-meta">
                  <div className="notification-timestamp">{formatRelativeShort(notification.timestamp)}</div>
                </div>
              </div>
              {(() => {
                const detail = getNotificationDetail(notification)
                return detail ? (
                  <div className="notif__detail">{detail}</div>
                ) : null
              })()}
            </div>
          </div>
        )
      })}
    </div>
  )
}

