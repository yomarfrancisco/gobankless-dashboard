'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import { UserCircle2, Share2, LogOut } from 'lucide-react'
import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'
import AvatarActionSheet from './AvatarActionSheet'
import { useProfileEditSheet } from '@/store/useProfileEditSheet'
import { useNameHandleSheet } from '@/store/useNameHandleSheet'
import { useUserProfileStore } from '@/store/userProfile'
import { useWalletMode } from '@/state/walletMode'
import { uploadAvatar, removeAvatar } from '@/lib/profile'
import { resizeImage } from '@/lib/imageResize'
import { useNotificationStore } from '@/store/notifications'
import styles from './ProfileEditSheet.module.css'

export default function ProfileEditSheet() {
  const router = useRouter()
  const { isOpen, close } = useProfileEditSheet()
  const { open: openNameHandle } = useNameHandleSheet()
  const { profile, setProfile } = useUserProfileStore()
  const { setMode } = useWalletMode()
  const pushNotification = useNotificationStore((state) => state.pushNotification)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false)
  const fileInputLibraryRef = useRef<HTMLInputElement>(null)
  const fileInputCameraRef = useRef<HTMLInputElement>(null)
  const fileInputFileRef = useRef<HTMLInputElement>(null)

  // Sync avatarUrl from store when profile changes
  useEffect(() => {
    setAvatarUrl(profile.avatarUrl)
  }, [profile.avatarUrl])

  const handleProfilePicture = () => {
    setAvatarSheetOpen(true)
  }

  const handleAvatarAction = async (action: 'library' | 'camera' | 'file' | 'remove') => {
    if (typeof window === 'undefined') return

    // Close sheet immediately
    setAvatarSheetOpen(false)

    if (action === 'remove') {
      // Remove photo
      setIsUploading(true)
      const previousAvatarUrl = avatarUrl

      try {
        await removeAvatar()
        setAvatarUrl(null)
        setProfile({ avatarUrl: null })
      } catch (err) {
        console.error('Failed to remove avatar:', err)
        // Revert on error
        setAvatarUrl(previousAvatarUrl)
        pushNotification({
          kind: 'payment_failed',
          title: 'Remove failed',
          body: 'Could not remove photo. Please try again.',
          actor: { type: 'user' },
        })
      } finally {
        setIsUploading(false)
      }
      return
    }

    // Trigger the appropriate file input
    if (action === 'library' && fileInputLibraryRef.current) {
      fileInputLibraryRef.current.click()
    } else if (action === 'camera' && fileInputCameraRef.current) {
      fileInputCameraRef.current.click()
    } else if (action === 'file' && fileInputFileRef.current) {
      fileInputFileRef.current.click()
    }
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
          // Check if image needs resizing using createImageBitmap (faster) or HTMLImageElement (fallback)
          let needsResize = false

          if ('createImageBitmap' in window) {
            try {
              const bmp = await createImageBitmap(file)
              needsResize = bmp.width > 1024 || bmp.height > 1024
              bmp.close()
            } catch {
              // Fallback to HTMLImageElement if createImageBitmap fails
              const objectUrl = URL.createObjectURL(file)
              
              // Use a DOM-typed constructor that TS accepts
              const ImageCtor: new () => HTMLImageElement =
                (typeof globalThis !== 'undefined' && (globalThis as any).Image)
                  ? (globalThis as any).Image
                  : (class {} as unknown as new () => HTMLImageElement)
              
              const htmlImg = new ImageCtor()
              needsResize = await new Promise<boolean>((resolve) => {
                htmlImg.onload = () => {
                  resolve(htmlImg.width > 1024 || htmlImg.height > 1024)
                }
                htmlImg.onerror = () => resolve(false)
                htmlImg.src = objectUrl
              })
              URL.revokeObjectURL(objectUrl)
            }
          } else {
            // Fallback to HTMLImageElement
            const objectUrl = URL.createObjectURL(file)
            
            // Use a DOM-typed constructor that TS accepts
            const ImageCtor: new () => HTMLImageElement =
              (typeof globalThis !== 'undefined' && (globalThis as any).Image)
                ? (globalThis as any).Image
                : (class {} as unknown as new () => HTMLImageElement)
            
            const htmlImg = new ImageCtor()
            needsResize = await new Promise<boolean>((resolve) => {
              htmlImg.onload = () => {
                resolve(htmlImg.width > 1024 || htmlImg.height > 1024)
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

      // Update profile store
      setProfile({ avatarUrl: url })

      // No success notification - avatar updates immediately (optimistic UI)
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
    openNameHandle()
  }

  const handleSocialLinks = () => {
    close()
    console.log('Edit social links')
  }

  const handleLogout = () => {
    close()

    // Clear session/splash flag so intro shows again
    try {
      sessionStorage.removeItem('gob_splash_shown')
    } catch {
      // Ignore sessionStorage errors
    }

    // Reset wallet mode to Manual
    setMode('manual')

    // Clear profile state (optional - depends on requirements)
    // For now, we'll keep profile data but could reset if needed
    // useUserProfileStore.getState().reset()

    // Navigate to home
    router.push('/')
  }

  // Avatar icon component for Profile Picture tile
  const AvatarIcon = () => {
    const showDefault = !avatarUrl
    const initial = getInitial(profile.fullName, profile.email, profile.userHandle)

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
    const initial = fullName?.[0] || email?.[0] || handle?.replace(/^[@$]/, '')[0] || '?'
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.addIconSvg}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 14.1217 19.1571 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20ZM13 11H15.5C15.7761 11 16 11.2239 16 11.5V12.5C16 12.7761 15.7761 13 15.5 13H13V15.5C13 15.7761 12.7761 16 12.5 16H11.5C11.2239 16 11 15.7761 11 15.5V13H8.5C8.22386 13 8 12.7761 8 12.5V11.5C8 11.2239 8.22386 11 8.5 11H11V8.5C11 8.22386 11.2239 8 11.5 8H12.5C12.7761 8 13 8.22386 13 8.5V11Z"
                  fill="currentColor"
                />
              </svg>
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

      {/* Avatar Action Sheet (inline, appears over Edit Profile) */}
      <AvatarActionSheet
        open={avatarSheetOpen}
        onClose={() => setAvatarSheetOpen(false)}
        onSelect={handleAvatarAction}
      />

      {/* Hidden file inputs for different actions */}
      <input
        ref={fileInputLibraryRef}
        type="file"
        accept="image/*"
        className={styles.fileInput}
        onChange={handleFileChange}
      />
      <input
        ref={fileInputCameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={styles.fileInput}
        onChange={handleFileChange}
      />
      <input
        ref={fileInputFileRef}
        type="file"
        accept="image/*"
        className={styles.fileInput}
        onChange={handleFileChange}
      />
    </>
  )
}
