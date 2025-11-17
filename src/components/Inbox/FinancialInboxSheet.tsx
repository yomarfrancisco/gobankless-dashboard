'use client'

import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useFinancialInboxStore } from '@/state/financialInbox'
import InboxList from './InboxList'
import DirectMessage from './DirectMessage'
import styles from './FinancialInboxSheet.module.css'

export function FinancialInboxSheet() {
  const { isInboxOpen, activeThreadId, closeInbox } = useFinancialInboxStore()

  // Lock background scroll while open
  useEffect(() => {
    if (!isInboxOpen) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prev
      document.documentElement.style.overflow = ''
    }
  }, [isInboxOpen])

  // Close on ESC
  useEffect(() => {
    if (!isInboxOpen) return

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeInbox()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isInboxOpen, closeInbox])

  if (!isInboxOpen) return null

  return ReactDOM.createPortal(
    <div className={styles.backdrop} aria-modal="true" role="dialog">
      <button className={styles.overlay} aria-label="Close" onClick={closeInbox} />
      <div className={styles.popup}>
        {activeThreadId ? (
          <DirectMessage threadId={activeThreadId} />
        ) : (
          <InboxList />
        )}
      </div>
    </div>,
    document.body
  )
}

