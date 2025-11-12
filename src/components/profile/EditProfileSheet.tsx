'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Camera, Trash2, X, ChevronRight } from 'lucide-react'
import { useUserProfileStore } from '@/store/userProfile'
import Avatar from '@/components/Avatar'
import styles from './EditProfileSheet.module.css'

export default function EditProfileSheet() {
  const router = useRouter()
  const { profile, updateProfile, resetAvatarToDefault } = useUserProfileStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Local state for editing
  const [editingHandle, setEditingHandle] = useState(false)
  const [editingFullName, setEditingFullName] = useState(false)
  const [localHandle, setLocalHandle] = useState(profile.handle)
  const [localFullName, setLocalFullName] = useState(profile.fullName || '')
  const [localLinks, setLocalLinks] = useState(profile.links || {})
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      setPreviewAvatar(dataUrl)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleResetAvatar = useCallback(() => {
    resetAvatarToDefault()
    setPreviewAvatar(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [resetAvatarToDefault])

  const handleSave = useCallback(() => {
    updateProfile({
      handle: localHandle,
      fullName: localFullName || undefined,
      links: localLinks,
      avatarUrl: previewAvatar || profile.avatarUrl,
      avatarDefault: !previewAvatar && !profile.avatarUrl,
    })
    router.back()
  }, [localHandle, localFullName, localLinks, previewAvatar, profile.avatarUrl, updateProfile, router])

  const getInitial = () => {
    const name = localFullName || profile.fullName
    const email = profile.email
    const handle = profile.handle
    const initial = name?.[0] || email?.[0] || handle?.replace('$', '')[0] || '?'
    return initial.toUpperCase()
  }

  const avatarUrl = previewAvatar || (profile.avatarDefault ? undefined : profile.avatarUrl)

  return (
    <div className={styles.sheet}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Edit profile</h2>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          <X size={24} />
        </button>
      </div>

      <div className={styles.content}>
        {/* Avatar Block */}
        <div className={styles.avatarBlock}>
          <div className={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile avatar"
                fill
                className={styles.avatarImg}
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <Image
                src="/assets/avatar-profile.png"
                alt="Default avatar"
                fill
                className={styles.avatarImg}
                style={{ objectFit: 'cover' }}
              />
            )}
            <span className={styles.avatarInitial}>{getInitial()}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className={styles.fileInput}
              aria-label="Upload avatar"
            />
            <button
              className={styles.cameraBtn}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload photo"
            >
              <Camera size={16} />
            </button>
            {!profile.avatarDefault && (
              <button
                className={styles.trashBtn}
                onClick={handleResetAvatar}
                aria-label="Reset to default"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Form List */}
        <div className={styles.formList}>
          {/* Username Row */}
          <div className={styles.formRow}>
            <div className={styles.formLabel}>Username</div>
            {editingHandle ? (
              <input
                type="text"
                value={localHandle}
                onChange={(e) => setLocalHandle(e.target.value)}
                onBlur={() => setEditingHandle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingHandle(false)
                }}
                className={styles.formInput}
                autoFocus
              />
            ) : (
              <button
                className={styles.formValue}
                onClick={() => setEditingHandle(true)}
              >
                <span>{localHandle}</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Full Name Row */}
          <div className={styles.formRow}>
            <div className={styles.formLabel}>Full name</div>
            {editingFullName ? (
              <input
                type="text"
                value={localFullName}
                onChange={(e) => setLocalFullName(e.target.value)}
                onBlur={() => setEditingFullName(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingFullName(false)
                }}
                placeholder="Enter your first and last name"
                className={styles.formInput}
                autoFocus
              />
            ) : (
              <button
                className={styles.formValue}
                onClick={() => setEditingFullName(true)}
              >
                <span>{localFullName || 'Enter your first and last name'}</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Public Links Section */}
          <div className={styles.sectionTitle}>Public links</div>

          {/* Instagram */}
          <div className={styles.formRow}>
            <div className={styles.formLabelWithIcon}>
              <Image
                src="/assets/profile/instagram.svg"
                alt="Instagram"
                width={20}
                height={20}
              />
              <span>Instagram</span>
            </div>
            <button
              className={styles.formValue}
              onClick={() => {
                const url = prompt('Enter Instagram URL:', localLinks.instagram || '')
                if (url !== null) {
                  setLocalLinks({ ...localLinks, instagram: url || undefined })
                }
              }}
            >
              <span>{localLinks.instagram || 'Add link'}</span>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* LinkedIn */}
          <div className={styles.formRow}>
            <div className={styles.formLabelWithIcon}>
              <Image
                src="/assets/profile/linkedin.svg"
                alt="LinkedIn"
                width={20}
                height={20}
              />
              <span>LinkedIn</span>
            </div>
            <button
              className={styles.formValue}
              onClick={() => {
                const url = prompt('Enter LinkedIn URL:', localLinks.linkedin || '')
                if (url !== null) {
                  setLocalLinks({ ...localLinks, linkedin: url || undefined })
                }
              }}
            >
              <span>{localLinks.linkedin || 'Add link'}</span>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* TikTok */}
          <div className={styles.formRow}>
            <div className={styles.formLabelWithIcon}>
              <span>TikTok</span>
            </div>
            <button
              className={styles.formValue}
              onClick={() => {
                const url = prompt('Enter TikTok URL:', localLinks.tiktok || '')
                if (url !== null) {
                  setLocalLinks({ ...localLinks, tiktok: url || undefined })
                }
              }}
            >
              <span>{localLinks.tiktok || 'Add link'}</span>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* X (Twitter) */}
          <div className={styles.formRow}>
            <div className={styles.formLabelWithIcon}>
              <span>X</span>
            </div>
            <button
              className={styles.formValue}
              onClick={() => {
                const url = prompt('Enter X URL:', localLinks.x || '')
                if (url !== null) {
                  setLocalLinks({ ...localLinks, x: url || undefined })
                }
              }}
            >
              <span>{localLinks.x || 'Add link'}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Done Button */}
        <button className={styles.doneBtn} onClick={handleSave}>
          Done
        </button>
      </div>
    </div>
  )
}

