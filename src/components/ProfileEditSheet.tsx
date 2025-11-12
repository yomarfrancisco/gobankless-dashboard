'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { UserCircle2, Share2, LogOut } from 'lucide-react'
import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'
import AvatarActionSheet from './AvatarActionSheet'
import { useProfileEditSheet } from '@/store/useProfileEditSheet'
import { uploadAvatar } from '@/lib/profile'
import styles from './ProfileEditSheet.module.css'

// Temporary profile data - will use store when available
const defaultProfile = {
  fullName: 'Samuel Akoyo',
  email: 'samakoyo@example.com',
  handle: '$samakoyo',
  avatarUrl: null as string | null,
}

export default function ProfileEditSheet() {
  const { isOpen, close } = useProfileEditSheet()
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(defaultProfile.avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // TODO: Use useUserProfileStore when available
  const profile = { ...defaultProfile, avatarUrl }

  const handleProfilePicture = () => {
    setAvatarSheetOpen(true)
  }

  const handleAvatarAction = async (action: 'library' | 'camera' | 'file') => {
    if (!fileInputRef.current) return

    // Configure file input based on action
    if (action === 'library') {
      fileInputRef.current.accept = 'image/*'
      ;(fileInputRef.current as any).capture = undefined
    } else if (action === 'camera') {
      fileInputRef.current.accept = 'image/*'
      ;(fileInputRef.current as any).capture = 'environment'
    } else if (action === 'file') {
      fileInputRef.current.accept = ''
      ;(fileInputRef.current as any).capture = undefined
    }

    fileInputRef.current.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large (max 5MB).')
      e.target.value = ''
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please use JPEG, PNG, WebP, or HEIC.')
      e.target.value = ''
      return
    }

    try {
      // Upload avatar (stub returns data URL for now)
      const url = await uploadAvatar(file)
      setAvatarUrl(url)
      // TODO: Update profile store
      // updateProfile({ avatarUrl: url })
    } catch (err) {
      console.error('Failed to upload avatar:', err)
      alert('Could not update photo. Try again.')
    } finally {
      e.target.value = ''
    }
  }

  const handleNameHandle = () => {
    close()
    console.log('Edit name/handle')
  }

  const handleSocialLinks = () => {
    close()
    console.log('Edit social links')
  }

  const handleLogout = () => {
    close()
    console.log('Logout')
  }

  // Avatar icon component for Profile Picture tile
  const AvatarIcon = () => {
    const showDefault = !avatarUrl
    const initial = getInitial(profile.fullName, profile.email, profile.handle)

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          background: '#1a1a1a',
        }}
      >
        {showDefault ? (
          <>
            <Image
              src="/assets/avatar-profile.png"
              alt="Profile avatar"
              fill
              style={{ objectFit: 'cover' }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 300,
                color: '#f5f5f5',
                textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              {initial}
            </span>
          </>
        ) : (
          <Image
            src={avatarUrl}
            alt="Profile avatar"
            fill
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        )}
      </div>
    )
  }

  function getInitial(fullName?: string, email?: string, handle?: string): string {
    const initial = fullName?.[0] || email?.[0] || handle?.replace('$', '')[0] || '?'
    return initial.toUpperCase()
  }

  return (
    <>
      <ActionSheet open={isOpen} onClose={close} title="Edit Profile">
        <ActionSheetItem
          icon={<AvatarIcon />}
          title="Profile picture"
          caption="Update your photo"
          onClick={handleProfilePicture}
          trailing={
            <button
              className={styles.addIconButton}
              onClick={(e) => {
                e.stopPropagation()
                handleProfilePicture()
              }}
              aria-label="Change profile photo"
              type="button"
            >
              <Image
                src="/assets/profile/add_circle_outlined.svg"
                alt=""
                width={24}
                height={24}
              />
            </button>
          }
        />
        <ActionSheetItem
          icon={<UserCircle2 size={22} strokeWidth={2} style={{ color: '#111' }} />}
          title="Name & Handle"
          caption="Edit your display name and unique handle"
          onClick={handleNameHandle}
        />
        <ActionSheetItem
          icon={<Share2 size={22} strokeWidth={2} style={{ color: '#111' }} />}
          title="Social Links"
          caption="Add or update your Instagram, LinkedIn, and TikTok links"
          onClick={handleSocialLinks}
        />
        <ActionSheetItem
          icon={<LogOut size={22} strokeWidth={2} style={{ color: '#111' }} />}
          title="Log Out"
          caption="Sign out of your account securely"
          onClick={handleLogout}
        />
      </ActionSheet>

      {/* Avatar Action Sheet (opens on top of Edit Profile) */}
      <AvatarActionSheet
        open={avatarSheetOpen}
        onClose={() => setAvatarSheetOpen(false)}
        onSelect={handleAvatarAction}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.fileInput}
        onChange={handleFileChange}
      />
    </>
  )
}
