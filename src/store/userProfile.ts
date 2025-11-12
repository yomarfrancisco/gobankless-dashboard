import { create } from 'zustand'

export type PublicLinks = {
  instagram?: string
  linkedin?: string
  tiktok?: string
  x?: string
}

export type UserProfile = {
  avatarUrl?: string // data URL after upload or hosted path
  avatarDefault?: boolean // true if using /assets/avatar-profile.png
  fullName?: string
  handle: string // e.g., "$samakoyo"
  email?: string
  links?: PublicLinks
}

type UserProfileState = {
  profile: UserProfile
  updateProfile: (partial: Partial<UserProfile>) => void
  resetAvatarToDefault: () => void
}

const defaultProfile: UserProfile = {
  handle: '$samakoyo',
  fullName: 'Samuel Akoyo',
  email: 'samakoyo@example.com',
  avatarDefault: true,
  links: {},
}

export const useUserProfileStore = create<UserProfileState>((set) => {
  // Load from localStorage on init
  const loadProfile = (): UserProfile => {
    if (typeof window === 'undefined') return defaultProfile
    try {
      const stored = localStorage.getItem('gb.userProfile')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {}
    return defaultProfile
  }

  const savedProfile = loadProfile()

  return {
    profile: savedProfile,
    updateProfile: (partial) => {
      set((state) => {
        const updated = { ...state.profile, ...partial }
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('gb.userProfile', JSON.stringify(updated))
          } catch {}
        }
        return { profile: updated }
      })
    },
    resetAvatarToDefault: () => {
      set((state) => {
        const updated = {
          ...state.profile,
          avatarUrl: undefined,
          avatarDefault: true,
        }
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('gb.userProfile', JSON.stringify(updated))
          } catch {}
        }
        return { profile: updated }
      })
    },
  }
})

