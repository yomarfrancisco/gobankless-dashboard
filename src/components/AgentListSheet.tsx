'use client'

import Image from 'next/image'
import ActionSheet from './ActionSheet'
import styles from './AgentListSheet.module.css'

type Agent = {
  id: string
  username: string
  avatar: string
  insured: string
  rating: number
  reviewCount: number
  progress: number // 0-100 for progress bar
}

const AGENTS: Agent[] = [
  {
    id: 'kerryy',
    username: '$kerryy',
    avatar: '/assets/avatar_agent5.png',
    insured: 'R49k Insured',
    rating: 4.1,
    reviewCount: 1322,
    progress: 98,
  },
  {
    id: 'ariel',
    username: '$ariel',
    avatar: '/assets/avatar_agent6.png',
    insured: 'R40k Insured',
    rating: 5.0,
    reviewCount: 3,
    progress: 80,
  },
  {
    id: 'simi_love',
    username: '$simi_love',
    avatar: '/assets/avatar_agent7.png',
    insured: 'R22k Insured',
    rating: 4.9,
    reviewCount: 13,
    progress: 44,
  },
  {
    id: 'dana',
    username: '$dana',
    avatar: '/assets/avatar_agent8.png',
    insured: 'R11k Insured',
    rating: 4.8,
    reviewCount: 56,
    progress: 22,
  },
]

type AgentListSheetProps = {
  open: boolean
  onClose: () => void
}

export default function AgentListSheet({ open, onClose }: AgentListSheetProps) {
  return (
    <ActionSheet open={open} onClose={onClose} title="Select an agent nearby" size="tall" className={styles.agentListSheet}>
      <div className={styles.content}>
        {/* Fee row */}
        <div className={styles.feeRow}>
          <div className={styles.feeInfo}>
            <span className={styles.feeDot}>●</span>
            <span className={styles.feeText}>R8.40/km agent fee.</span>
          </div>
          <span className={styles.depositTime}>Expect to deposit in 30min</span>
        </div>

        {/* Agent grid */}
        <div className={styles.agentGrid}>
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              className={styles.agentCard}
              onClick={() => {
                // TODO: open dialog/chat
              }}
              type="button"
            >
              <div className={styles.agentAvatar}>
                <Image
                  src={agent.avatar}
                  alt={agent.username}
                  width={120}
                  height={120}
                  className={styles.avatarImage}
                />
              </div>
              <div className={styles.agentInfo}>
                <div className={styles.usernameRow}>
                  <span className={styles.username}>{agent.username}</span>
                  <Image
                    src="/assets/profile/verified.svg"
                    alt="Verified"
                    width={16}
                    height={16}
                    className={styles.verifiedBadge}
                  />
                </div>
                <div className={styles.insuredRow}>
                  <span className={styles.insuredText}>{agent.insured}</span>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                </div>
                <div className={styles.ratingRow}>
                  <span className={styles.ratingValue}>{agent.rating}</span>
                  <Image
                    src="/assets/profile/star.svg"
                    alt="Star"
                    width={14}
                    height={14}
                    className={styles.starIcon}
                  />
                  <span className={styles.reviewCount}>({agent.reviewCount.toLocaleString()})</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </ActionSheet>
  )
}

