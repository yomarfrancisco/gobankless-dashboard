'use client'

import { useEffect } from 'react'
import ReactDOM from 'react-dom'
import Image from 'next/image'
import { X, Camera, ChevronRight, Instagram, Linkedin, Music2, Mail } from 'lucide-react'
import { useProfileEditSheet } from '@/store/useProfileEditSheet'
import { useUserProfileStore } from '@/store/userProfile'
import styles from './ProfileEditSheet.module.css'

function getInitial(fullName?: string, email?: string, handle?: string): string {
  const initial = fullName?.[0] || email?.[0] || handle?.replace('$', '')[0] || '?'
  return initial.toUpperCase()
}

function Row({
  label,
  value,
  icon: Icon,
  onClick,
}: {
  label: string
  value?: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
}) {
  return (
    <button className={styles.row} onClick={onClick}>
      <div className={styles.rowLeft}>
        {Icon && <Icon className={styles.rowIcon} />}
        <span className={styles.rowLabel}>{label}</span>
      </div>
      {value && <span className={styles.rowValue}>{value}</span>}
      <ChevronRight className={styles.chevron} size={20} />
    </button>
  )
}

export default function ProfileEditSheet() {
  const { isOpen, close } = useProfileEditSheet()
  const { profile } = useUserProfileStore()
  const initial = getInitial(profile.fullName, profile.email, profile.handle)

  // Lock background scroll while open
  useEffect(() => {
    if (!isOpen) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prev
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  const handleClose = () => {
    close()
  }

  const handleDone = () => {
    close()
  }

  const handleCameraClick = () => {
    console.log('pick avatar')
  }

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div className={styles.sheet} aria-modal="true" role="dialog">
      <button className={styles.overlay} onClick={handleClose} aria-label="Close" />
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Edit profile</h2>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className={styles.scrollArea}>
          {/* Capsule A: Avatar + Username + Full name */}
          <div className={styles.capsule}>
            {/* Avatar Block */}
            <div className={styles.avatarBlock}>
              <div className={styles.avatar}>
                <Image
                  src="/assets/avatar-profile.png"
                  alt="Default avatar"
                  fill
                  className={styles.avatarImg}
                  priority
                />
                <span className={styles.initial}>{initial}</span>
                <button
                  className={styles.cameraBtn}
                  onClick={handleCameraClick}
                  aria-label="Change avatar"
                >
                  <Camera size={16} />
                </button>
              </div>
            </div>

            {/* Username Row */}
            <Row
              label="Username"
              value={profile.handle}
              onClick={() => console.log('edit username')}
            />

            {/* Full Name Row */}
            <Row
              label="Full name"
              value={profile.fullName || undefined}
              onClick={() => console.log('edit full name')}
            />
          </div>

          {/* Capsule B: Public Links */}
          <div className={styles.linksSection}>
            <h3 className={styles.linksHeader}>PUBLIC LINKS</h3>
            <div className={styles.capsule}>
              <Row
                label="Instagram"
                icon={Instagram}
                onClick={() => console.log('edit instagram')}
              />
              <Row
                label="LinkedIn"
                icon={Linkedin}
                onClick={() => console.log('edit linkedin')}
              />
              <Row
                label="TikTok"
                icon={Music2}
                onClick={() => console.log('edit tiktok')}
              />
              <Row
                label="Mail"
                icon={Mail}
                onClick={() => console.log('edit mail')}
              />
            </div>
          </div>
        </div>

        {/* Footer: Done Button */}
        <div className={styles.footer}>
          <button className={styles.doneBtn} onClick={handleDone}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

