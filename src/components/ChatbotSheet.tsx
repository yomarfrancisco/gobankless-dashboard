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
      title="Talk to your BRICS fund manager"
      size="tall"
      className={styles.sheet}
    >
      <div className={styles.iframeContainer}>
        <iframe
          src="https://chat.mystablecoin.app/chatbot-iframe/2wO054pAvier4ISsuZd_X"
          width="100%"
          className={styles.iframe}
          loading="lazy"
          title="BRICS fund manager chat"
        />
      </div>
    </ActionSheet>
  )
}

