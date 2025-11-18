'use client'

import Image from 'next/image'
import ActionSheet from '../ActionSheet'
import { useFinancialInboxStore } from '@/state/financialInbox'
import styles from './FinancialInboxSheet.module.css'

export default function FinancialInboxSheet() {
  const { isInboxOpen, closeInbox } = useFinancialInboxStore()

  return (
    <ActionSheet
      open={isInboxOpen}
      onClose={closeInbox}
      title=""
      size="tall"
      className="financial-inbox-sheet"
    >
      <div className={styles.container}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <button className={styles.backButton} onClick={closeInbox} aria-label="Back">
            <Image
              src="/assets/back_ui.svg"
              alt="Back"
              width={24}
              height={24}
            />
          </button>
          <div className={styles.avatar}>
            <Image
              src="/assets/Brics-girl-blue.png"
              alt="$BRICS Diamond"
              width={38}
              height={38}
              className={styles.avatarImage}
              unoptimized
            />
          </div>
          <div className={styles.name}>$BRICS Diamond</div>
        </div>

        {/* Divider line */}
        <div className={styles.divider} />

        {/* Message area */}
        <div className={styles.messageArea}>
          <div className={styles.messageWrapper}>
            <div className={styles.messageAvatar}>
              <Image
                src="/assets/Brics-girl-blue.png"
                alt="Baby Diamond"
                width={31}
                height={31}
                className={styles.messageAvatarImage}
                unoptimized
              />
            </div>
            <div className={styles.bubbleContainer}>
              <div className={styles.messageBubble}>
                Longer reply. Assess borrower risk and price accordingly via lender-specific interest rates. Receive a return on deposited capital even if funds are not drawn down. Withdraw deposited capital on-demand if funds aren&apos;t drawn down by a Borrower.
              </div>
              <div className={styles.timestamp}>14:09</div>
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className={styles.inputBar}>
          <button className={styles.attachButton} aria-label="Attach">
            <Image
              src="/assets/attachment_diagonal.svg"
              alt="Attach"
              width={24}
              height={24}
            />
          </button>
          <input
            type="text"
            className={styles.input}
            placeholder="Type a message..."
          />
        </div>
      </div>
    </ActionSheet>
  )
}

