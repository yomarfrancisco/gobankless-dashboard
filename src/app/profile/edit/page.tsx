'use client'

import Link from 'next/link'
import Image from 'next/image'
import { X, Camera, ChevronRight } from 'lucide-react'
import { useUserProfileStore } from '@/store/userProfile'
import { useRouter } from 'next/navigation'
import styles from './ProfileEdit.module.css'

function getInitial(fullName?: string, email?: string, handle?: string): string {
  const initial = fullName?.[0] || email?.[0] || handle?.replace('$', '')[0] || '?'
  return initial.toUpperCase()
}

function Row({
  label,
  value,
  href,
  placeholder = false,
  icon,
}: {
  label: string
  value: string
  href: string
  placeholder?: boolean
  icon?: string
}) {
  return (
    <Link href={href} className={styles.row}>
      <div className={styles.rowLabel}>
        {icon && <Image src={icon} alt="" width={20} height={20} />}
        <span>{label}</span>
      </div>
      <div className={placeholder ? styles.rowValuePlaceholder : styles.rowValue}>
        {value}
      </div>
      <ChevronRight size={20} className={styles.chevron} />
    </Link>
  )
}

export default function ProfileEdit() {
  const router = useRouter()
  const { profile, updateProfile } = useUserProfileStore()
  const initial = getInitial(profile.fullName, profile.email, profile.handle)

  const handleDone = () => {
    // Save any pending changes
    router.push('/profile')
  }

  const handleCameraClick = () => {
    console.log('pick avatar')
    // TODO: Implement image picker
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <h1>Edit profile</h1>
        <Link href="/profile" aria-label="Close" className={styles.closeBtn}>
          <X size={24} />
        </Link>
      </header>

      <section className={styles.avatarBlock}>
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
      </section>

      <section className={styles.card}>
        <Row
          label="Username"
          value={`${profile.handle}`}
          href="/profile/edit/username"
        />
        <Row
          label="Full name"
          value={profile.fullName || 'Enter your first and last name'}
          href="/profile/edit/fullname"
          placeholder={!profile.fullName}
        />
      </section>

      <h3 className={styles.linksHeader}>PUBLIC LINKS</h3>

      <section className={styles.card}>
        <Row
          label="Instagram"
          value={profile.links?.instagram || 'Add link'}
          href="/profile/edit/instagram"
          placeholder={!profile.links?.instagram}
          icon="/assets/profile/instagram.svg"
        />
        <Row
          label="LinkedIn"
          value={profile.links?.linkedin || 'Add link'}
          href="/profile/edit/linkedin"
          placeholder={!profile.links?.linkedin}
          icon="/assets/profile/linkedin.svg"
        />
        <Row
          label="TikTok"
          value={profile.links?.tiktok || 'Add link'}
          href="/profile/edit/tiktok"
          placeholder={!profile.links?.tiktok}
        />
        <Row
          label="X"
          value={profile.links?.x || 'Add link'}
          href="/profile/edit/x"
          placeholder={!profile.links?.x}
        />
      </section>

      <div className={styles.cta}>
        <button className={styles.btnDone} onClick={handleDone}>
          Done
        </button>
      </div>
    </div>
  )
}
