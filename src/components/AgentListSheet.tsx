'use client'

import Image from 'next/image'
import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'
import styles from './AgentListSheet.module.css'

type Agent = {
  id: string
  username: string
  avatar: string
  insured: string
  rating: number
  reviewCount: number
}

const AGENTS: Agent[] = [
  {
    id: 'kerryy',
    username: '$kerryy',
    avatar: '/assets/avatar_agent5.png',
    insured: 'R49k',
    rating: 4.1,
    reviewCount: 1322,
  },
  {
    id: 'ariel',
    username: '$ariel',
    avatar: '/assets/avatar_agent6.png',
    insured: 'R40k',
    rating: 5.0,
    reviewCount: 3,
  },
  {
    id: 'simi_love',
    username: '$simi_love',
    avatar: '/assets/avatar_agent7.png',
    insured: 'R22k',
    rating: 4.9,
    reviewCount: 13,
  },
  {
    id: 'dana',
    username: '$dana',
    avatar: '/assets/avatar_agent8.png',
    insured: 'R11k',
    rating: 4.8,
    reviewCount: 56,
  },
]

type AgentListSheetProps = {
  open: boolean
  onClose: () => void
}

export default function AgentListSheet({ open, onClose }: AgentListSheetProps) {
  const handleWhatsAppClick = () => {
    if (typeof window === 'undefined') return
    window.open('https://wa.me/27823306256', '_blank')
  }

  const formatSubtitle = (agent: Agent) => {
    return `Insured up to ${agent.insured} · ${agent.rating}★ · ${agent.reviewCount.toLocaleString()} transfers`
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="Talk to an agent" size="compact" className={styles.agentListSheet}>
      <div className={styles.content}>
        <p className={styles.subtitle}>Message a trusted branch manager on WhatsApp.</p>
        <div className={styles.divider} />
        
        {AGENTS.map((agent) => (
          <ActionSheetItem
            key={agent.id}
            icon={
              <div className={styles.avatarWrapper}>
                <Image
                  src={agent.avatar}
                  alt={agent.username}
                  width={56}
                  height={56}
                  className={styles.avatar}
                />
              </div>
            }
            title={agent.username}
            caption={formatSubtitle(agent)}
            onClick={handleWhatsAppClick}
            trailing={
              <button
                className={styles.whatsappButton}
                onClick={(e) => {
                  e.stopPropagation()
                  handleWhatsAppClick()
                }}
                aria-label={`Contact ${agent.username} via WhatsApp`}
                type="button"
              >
                <Image
                  src="/assets/WhatsApp_Balck.png"
                  alt="WhatsApp"
                  width={24}
                  height={24}
                  className={styles.whatsappIcon}
                />
              </button>
            }
          />
        ))}
      </div>
    </ActionSheet>
  )
}
