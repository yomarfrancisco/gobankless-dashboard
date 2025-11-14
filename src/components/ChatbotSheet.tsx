'use client'

import React from 'react'
import ReactDOM from 'react-dom'
import Image from 'next/image'
import styles from './ChatbotSheet.module.css'

type ChatbotSheetProps = {
  open: boolean
  onClose: () => void
}

export function ChatbotSheet({ open, onClose }: ChatbotSheetProps) {
  // Lock background scroll while open
  React.useEffect(() => {
    if (!open) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prev
      document.documentElement.style.overflow = ''
    }
  }, [open])

  // Close on ESC
  React.useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return ReactDOM.createPortal(
    <div className={styles.backdrop} aria-modal="true" role="dialog">
      <button className={styles.overlay} aria-label="Close" onClick={onClose} />
      <div className={styles.popup}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          <Image src="/assets/clear.svg" alt="" width={18} height={18} />
        </button>
        <div className={styles.popupBody}>
          <div className={styles.frameContainer}>
            <iframe
              src="https://chat.mystablecoin.app/chatbot-iframe/2wO054pAvier4ISsuZd_X"
              title="$BRICS Diamond"
              className={styles.iframe}
              loading="lazy"
              allow="clipboard-write; microphone; camera"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

