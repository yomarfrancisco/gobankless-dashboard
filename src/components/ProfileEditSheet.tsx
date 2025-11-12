'use client'

import { useState, useRef } from 'react'
import NextImage from 'next/image'
import { UserCircle2, Share2, LogOut } from 'lucide-react'
import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'
import AvatarActionSheet from './AvatarActionSheet'
import { useProfileEditSheet } from '@/store/useProfileEditSheet'
import { uploadAvatar } from '@/lib/profile'
import { resizeImage } from '@/lib/imageResize'
import { useNotificationStore } from '@/store/notifications'
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
  const pushNotification = useNotificationStore((state) => state.pushNotification)
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(defaultProfile.avatarUrl)
  const [isUploading, setIsUploading] = useState(false)
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
      pushNotification({
        kind: 'payment_failed',
        title: 'Image too large',
        body: 'Maximum file size is 5MB. Please choose a smaller image.',
        actor: { type: 'user' },
      })
      e.target.value = ''
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!validTypes.includes(file.type)) {
      pushNotification({
        kind: 'payment_failed',
        title: 'Invalid file type',
        body: 'Please use JPEG, PNG, WebP, or HEIC format.',
        actor: { type: 'user' },
      })
      e.target.value = ''
      return
    }

    setIsUploading(true)
    const previousAvatarUrl = avatarUrl

    try {
      // Optimistic UI: show preview immediately
      const previewUrl = URL.createObjectURL(file)
      setAvatarUrl(previewUrl)

      // Resize if needed (optional: only if > 1024px)
      let fileToUpload = file
      try {
        if (typeof window === 'undefined') {
          // SSR guard - skip resize check on server
          fileToUpload = file
        } else {
          // Check if image needs resizing using createImageBitmap (faster) or window.Image (fallback)
          let needsResize = false

          if ('createImageBitmap' in window) {
            try {
              const bmp = await createImageBitmap(file)
              needsResize = bmp.width > 1024 || bmp.height > 1024
              bmp.close()
            } catch {
              // Fallback to window.Image if createImageBitmap fails
              const objectUrl = URL.createObjectURL(file)
              const htmlImg = new window.Image()
              needsResize = await new Promise<boolean>((resolve) => {
                htmlImg.onload = () => {
                  const resize = htmlImg.width > 1024 || htmlImg.height > 1024
                  resolve(resize)
                }
                htmlImg.onerror = () => resolve(false)
                htmlImg.src = objectUrl
              })
              URL.revokeObjectURL(objectUrl)
            }
          } else {
            // Fallback to window.Image
            const objectUrl = URL.createObjectURL(file)
            const htmlImg = new window.Image()
            needsResize = await new Promise<boolean>((resolve) => {
              htmlImg.onload = () => {
                const resize = htmlImg.width > 1024 || htmlImg.height > 1024
                resolve(resize)
              }
              htmlImg.onerror = () => resolve(false)
              htmlImg.src = objectUrl
            })
            URL.revokeObjectURL(objectUrl)
          }

          if (needsResize) {
            fileToUpload = await resizeImage(file, { maxEdge: 1024 })
          }
        }
      } catch (resizeErr) {
        console.warn('Resize failed, using original:', resizeErr)
        // Continue with original file if resize fails
      }

      // Upload avatar
      const url = await uploadAvatar(fileToUpload)
      
      // Revoke preview URL and set final URL
      URL.revokeObjectURL(previewUrl)
      setAvatarUrl(url)

      // TODO: Update profile store
      // updateProfile({ avatarUrl: url })

      pushNotification({
        kind: 'payment_sent',
        title: 'Profile photo updated',
        body: 'Your profile picture has been updated successfully.',
        actor: { type: 'user' },
      })
    } catch (err) {
      console.error('Failed to upload avatar:', err)
      // Revert to previous avatar on error
      setAvatarUrl(previousAvatarUrl)
      pushNotification({
        kind: 'payment_failed',
        title: 'Upload failed',
        body: 'Could not update photo. Please try again.',
        actor: { type: 'user' },
      })
    } finally {
      setIsUploading(false)
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
            <NextImage
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
          <NextImage
            src={avatarUrl}
            alt="Profile avatar"
            fill
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        )}
        {isUploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
          </div>
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
              <NextImage
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
