'use client'

import Image from 'next/image'
import ActionSheet from '../ActionSheet'
import { useFinancialInboxStore } from '@/state/financialInbox'
import styles from './FinancialInboxListSheet.module.css'

/**
 * Financial Inbox List bottom sheet - shows list of threads
 * Uses tall height to match BRICS Diamond chat sheet
 */
export default function FinancialInboxListSheet() {
  const { isInboxOpen, closeInbox, openChatSheet } = useFinancialInboxStore()

  // Mock conversation data
  const conversations = [
    {
      id: 'brics',
      name: '$BRICS Diamond',
      avatar: '/assets/Brics-girl-blue.png',
      preview: 'Longer reply. Assess borrower risk and price accordingly via lender-specific interest rates. Receive a return on deposited capital even if funds are not drawn down. Withdraw deposited capital on-demand if funds aren\'t drawn down by a Borrower.',
      time: '16:09',
      unread: true,
    },
    {
      id: 'user-1',
      name: '$kerry',
      avatar: '/assets/avatar - profile (1).png',
      preview: 'Message received by me from another user going into two lines',
      time: '15:30',
      unread: false,
    },
    {
      id: 'user-2',
      name: '$simi_love',
      avatar: '/assets/avatar - profile (2).png',
      preview: 'Media with caption sent by me to another user...',
      time: '14:45',
      unread: false,
    },
    {
      id: 'user-3',
      name: '$ariel',
      avatar: '/assets/avatar - profile (3).png',
      preview: 'Photo',
      time: '13:20',
      unread: false,
    },
    {
      id: 'user-4',
      name: '$dana',
      avatar: '/assets/avatar - profile (4).png',
      preview: 'Video',
      time: '12:15',
      unread: false,
    },
    {
      id: 'user-5',
      name: '$thando',
      avatar: '/assets/avatar - profile (5).png',
      preview: 'File',
      time: '11:00',
      unread: false,
    },
  ]

  const handleRowClick = (id: string) => {
    if (id === 'brics') {
      openChatSheet('portfolio-manager')
    }
    // Other rows are static for now
  }

  return (
    <ActionSheet
      open={isInboxOpen}
      onClose={closeInbox}
      title="Financial inbox"
      size="tall"
      className={styles.financialInboxSheet}
    >
      <div className={styles.content}>
        <p className={styles.subtitle}>Messages from your financial agent.</p>
        <div className={styles.divider} />
        
        {/* Search bar */}
        <div className={styles.searchBar}>
          <div className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search inbox"
          />
        </div>

        {/* Conversation list - scrollable */}
        <div className={styles.conversationList}>
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={styles.inboxRow}
              onClick={() => handleRowClick(conversation.id)}
              type="button"
            >
              <div className={styles.inboxRowLeft}>
                <div className={styles.avatarWrapper}>
                  <Image
                    src={conversation.avatar}
                    alt={conversation.name}
                    width={64}
                    height={64}
                    className={styles.avatar}
                    unoptimized
                  />
                </div>
                <div className={styles.inboxTextBlock}>
                  <div className={styles.inboxHeader}>
                    <div className={styles.inboxTitle}>{conversation.name}</div>
                    <div className={styles.inboxTimeRow}>
                      <div className={styles.inboxTime}>{conversation.time}</div>
                      {conversation.unread && (
                        <div className={styles.unreadDot} />
                      )}
                    </div>
                  </div>
                  <div className={styles.inboxPreview}>
                    {conversation.preview}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </ActionSheet>
  )
}
