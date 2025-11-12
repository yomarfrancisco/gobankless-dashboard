'use client'

import Image from 'next/image'
import { Camera, ChevronRight } from 'lucide-react'
import ActionSheet from './ActionSheet'
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
  iconSrc,
  onClick,
}: {
  label: string
  value?: string
  iconSrc?: string
  onClick?: () => void
}) {
  return (
    <button className={styles.row} onClick={onClick}>
      <div className={styles.rowLeft}>
        {iconSrc && (
          <Image src={iconSrc} alt="" width={24} height={24} className={styles.rowIcon} />
        )}
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

  const handleCameraClick = () => {
    console.log('pick avatar')
  }

  const handleDone = () => {
    close()
  }

  return (
    <ActionSheet open={isOpen} onClose={close} title="" className={styles.profileEdit}>
      <div className={styles.content}>
        {/* Title below header */}
        <h2 className={styles.title}>Edit profile</h2>

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

        {/* Section Header */}
        <h3 className={styles.linksHeader}>PUBLIC LINKS</h3>

        {/* Capsule B: Public Links */}
        <div className={styles.capsule}>
          <Row
            label="Instagram"
            iconSrc="/assets/profile/instagram.svg"
            onClick={() => console.log('edit instagram')}
          />
          <Row
            label="LinkedIn"
            iconSrc="/assets/profile/linkedin.svg"
            onClick={() => console.log('edit linkedin')}
          />
          <Row
            label="TikTok"
            iconSrc="/assets/profile/tik_tok.svg"
            onClick={() => console.log('edit tiktok')}
          />
          <Row
            label="Mail"
            iconSrc="/assets/profile/mail.svg"
            onClick={() => console.log('edit mail')}
          />
        </div>

        {/* Footer: Done Button */}
        <div className={styles.footer}>
          <button className={styles.doneBtn} onClick={handleDone}>
            Done
          </button>
        </div>
      </div>
    </ActionSheet>
  )
}
