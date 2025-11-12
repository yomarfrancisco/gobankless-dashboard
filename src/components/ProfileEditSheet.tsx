'use client'

import Image from 'next/image'
import { UserCircle2, Share2, LogOut } from 'lucide-react'
import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'
import { useProfileEditSheet } from '@/store/useProfileEditSheet'
import { useAvatarEditSheet } from '@/store/useAvatarEditSheet'
// Temporary profile data - will use store when available
const defaultProfile = {
  fullName: 'Samuel Akoyo',
  email: 'samakoyo@example.com',
  handle: '$samakoyo',
}

export default function ProfileEditSheet() {
  const { isOpen, close } = useProfileEditSheet()
  const { open: openAvatarEdit } = useAvatarEditSheet()
  // TODO: Use useUserProfileStore when available
  const profile = defaultProfile

  const handleProfilePicture = () => {
    close()
    // Small delay to allow ProfileEditSheet to close first
    setTimeout(() => {
      openAvatarEdit()
    }, 220)
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
  // This will be rendered inside the asi-icon container (56px circle with gray background)
  const AvatarIcon = () => {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        position: 'relative',
        background: '#1a1a1a',
      }}>
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
          {getInitial(profile.fullName, profile.email, profile.handle)}
        </span>
      </div>
    )
  }

  function getInitial(fullName?: string, email?: string, handle?: string): string {
    const initial = fullName?.[0] || email?.[0] || handle?.replace('$', '')[0] || '?'
    return initial.toUpperCase()
  }

  return (
    <ActionSheet open={isOpen} onClose={close} title="Edit Profile">
      <ActionSheetItem
        icon={<AvatarIcon />}
        title="Profile Picture"
        caption="Change your avatar or upload a new one"
        onClick={handleProfilePicture}
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
  )
}

