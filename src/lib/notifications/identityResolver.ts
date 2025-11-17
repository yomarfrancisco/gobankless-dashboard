import type { ActorIdentity } from '@/store/notifications'

const DEFAULT_GOB_LOGO = '/assets/aa2b32f2dc3e3a159949cb59284abddef5683b05.png'
const AI_MANAGER_AVATAR = '/assets/Brics-girl-blue.png'
const MEMBER_DEFAULT = '/assets/avatar_agent1.png' // fallback for member if none provided
const CO_OP_BADGE = '/assets/profile/Avatar_case.svg' // co-op casing/badge

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
      // For now just use the co-op casing as the main avatar; we can layer later.
      return CO_OP_BADGE

    case 'system':
      return DEFAULT_GOB_LOGO

    case 'user':
    default:
      return DEFAULT_GOB_LOGO
  }
}

