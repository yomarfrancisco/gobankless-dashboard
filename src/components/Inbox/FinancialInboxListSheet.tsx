'use client'

import Image from 'next/image'
import ActionSheet from '../ActionSheet'
import { useFinancialInboxStore } from '@/state/financialInbox'
import styles from './FinancialInboxListSheet.module.css'

/**
 * Financial Inbox List bottom sheet - shows list of threads
 * Follows the same pattern as AgentListSheet
 */
export default function FinancialInboxListSheet() {
  const { threads, isInboxOpen, closeInbox, openChatSheet } = useFinancialInboxStore()

  // Get the BRICS Diamond thread (portfolio manager)
  const bricsThread = threads.find((t) => t.id === 'portfolio-manager')

  if (!bricsThread) return null

  const handleRowClick = () => {
    openChatSheet(bricsThread.id)
  }

  return (
    <ActionSheet
      open={isInboxOpen}
      onClose={closeInbox}
      title="Financial inbox"
      size="compact"
      className={styles.financialInboxSheet}
    >
      <div className={styles.content}>
        <p className={styles.subtitle}>Messages from your financial agent.</p>
        <div className={styles.divider} />
        
        {/* Single BRICS Diamond row */}
        <button
          className={styles.inboxRow}
          onClick={handleRowClick}
          type="button"
        >
          <div className={styles.inboxRowLeft}>
            <div className={styles.avatarWrapper}>
              <Image
                src={bricsThread.avatarUrl}
                alt={bricsThread.title}
                width={56}
                height={56}
                className={styles.avatar}
                unoptimized
              />
            </div>
            <div className={styles.inboxTextBlock}>
              <div className={styles.inboxHeader}>
                <div className={styles.inboxTitle}>{bricsThread.title}</div>
                <div className={styles.inboxTimeRow}>
                  <div className={styles.inboxTime}>{bricsThread.lastMessageAt}</div>
                  {bricsThread.unreadCount > 0 && (
                    <div className={styles.unreadDot} />
                  )}
                </div>
              </div>
              <div className={styles.inboxPreview}>
                {bricsThread.subtitle}
              </div>
            </div>
          </div>
        </button>
      </div>
    </ActionSheet>
  )
}
