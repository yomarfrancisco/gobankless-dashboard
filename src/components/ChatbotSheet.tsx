'use client'

import React from 'react'
import ActionSheet from './ActionSheet'
import styles from './ChatbotSheet.module.css'

type ChatbotSheetProps = {
  open: boolean
  onClose: () => void
}

export function ChatbotSheet({ open, onClose }: ChatbotSheetProps) {
  return (
    <ActionSheet
      open={open}
      onClose={onClose}
      title="" // Empty title - Chatbase handles its own header
      size="tall"
      className={styles.sheet}
    >
      <div className={styles.sheetBody}>
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
    </ActionSheet>
  )
}

