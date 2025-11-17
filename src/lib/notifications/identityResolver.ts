import type { ActorIdentity } from '@/store/notifications'
import { useUserProfileStore } from '@/store/userProfile'

const CO_OP_AVATAR = '/assets/avatar_coop.png'
const AI_MANAGER_AVATAR = '/assets/Brics-girl-blue.png'
const MEMBER_DEFAULT = '/assets/avatar_agent1.png' // fallback for member if none provided

/**
 * Resolves the avatar URL for a given actor identity.
 * Maps identity types to their default avatars, with fallbacks.
 */
export function resolveAvatarForActor(actor?: ActorIdentity): string {
  if (!actor) {
    // Fallback – generic app avatar (co-op)
    return CO_OP_AVATAR
  }

  // If actor has explicit avatar, use it
  if (actor.avatar) return actor.avatar

  // Otherwise, use identity-based defaults
  switch (actor.type) {
    case 'ai_manager':
      return AI_MANAGER_AVATAR

    case 'co_op':
      return CO_OP_AVATAR

    case 'system':
      // System can also use the co-op avatar for now
      return CO_OP_AVATAR

    case 'member':
      // Fallback for member if none provided – use first agent avatar
      return MEMBER_DEFAULT

    case 'user':
    default:
      // Let user profile logic override this where we have a real avatar
      const userProfile = useUserProfileStore.getState().profile
      return userProfile.avatarUrl || CO_OP_AVATAR
  }
}

