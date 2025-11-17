import type { ActorIdentity } from '@/store/notifications'
import { useUserProfileStore } from '@/store/userProfile'

const DEFAULT_GOB_LOGO = '/assets/aa2b32f2dc3e3a159949cb59284abddef5683b05.png'
const AI_MANAGER_AVATAR = '/assets/Brics-girl-blue.png'
const MEMBER_DEFAULT = '/assets/avatar_agent1.png' // fallback for member if none provided

/**
 * Resolves the avatar URL for a given actor identity.
 * Maps identity types to their default avatars, with fallbacks.
 */
export const resolveAvatarForActor = (actor?: ActorIdentity): string => {
  if (!actor) return DEFAULT_GOB_LOGO

  // If actor has explicit avatar, use it
  if (actor.avatar) return actor.avatar

  // Otherwise, use identity-based defaults
  switch (actor.type) {
    case 'ai_manager':
      return AI_MANAGER_AVATAR

    case 'member':
      return MEMBER_DEFAULT

    case 'co_op':
      // Co-op uses the GoBankless logo
      return DEFAULT_GOB_LOGO

    case 'system':
      return DEFAULT_GOB_LOGO

    case 'user':
      // Use current user's profile avatar if available, else GoB logo
      const userProfile = useUserProfileStore.getState().profile
      return userProfile.avatarUrl || DEFAULT_GOB_LOGO

    default:
      return DEFAULT_GOB_LOGO
  }
}

