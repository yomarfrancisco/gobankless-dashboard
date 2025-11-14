'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ChatbotSheet } from './ChatbotSheet'
import styles from './ChatAvatarButton.module.css'

export function ChatAvatarButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating avatar button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={styles.fab}
        aria-label="Open BRICS chat"
      >
        <div className={styles.avatarInner}>
          <Image
            src="/assets/Brics-girl-blue.png"
            alt="BRICS fund manager"
            width={56}
            height={56}
            className={styles.avatarImage}
          />
        </div>
      </button>

      {/* Popup sheet with Chatbase iframe */}
      <ChatbotSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}

