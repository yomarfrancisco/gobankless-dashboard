'use client'

import Image from 'next/image'
import styles from './BranchManagerFooter.module.css'

type BranchManagerFooterProps = {
  onWhatsAppClick?: () => void
}

export default function BranchManagerFooter({ onWhatsAppClick }: BranchManagerFooterProps) {
  const handleWhatsAppClick = () => {
    if (onWhatsAppClick) {
      onWhatsAppClick()
    } else {
      // Fallback to direct WhatsApp if no handler provided
      if (typeof window === 'undefined') return
      window.open('https://wa.me/27823306256', '_blank')
    }
  }

  return (
    <div className={styles.footer}>
      <div className={styles.leftSection}>
        <div className={styles.avatarsWrapper}>
          <div className={`${styles.avatarContainer} ${styles.avatar1}`}>
            <Image
              src="/assets/avatar_agent1.png"
              alt="Agent 1"
              width={31}
              height={31}
              className={styles.avatar}
            />
          </div>
          <div className={`${styles.avatarContainer} ${styles.avatar2}`}>
            <Image
              src="/assets/avatar_agent2.png"
              alt="Agent 2"
              width={31}
              height={31}
              className={styles.avatar}
            />
          </div>
          <div className={`${styles.avatarContainer} ${styles.avatar3}`}>
            <Image
              src="/assets/avatar_agent3.png"
              alt="Agent 3"
              width={31}
              height={31}
              className={styles.avatar}
            />
          </div>
          <div className={`${styles.avatarContainer} ${styles.avatar4}`}>
            <Image
              src="/assets/avatar_agent4.png"
              alt="Agent 4"
              width={31}
              height={31}
              className={styles.avatar}
            />
          </div>
        </div>
        <div className={styles.textContainer}>
          <span className={styles.count}>4</span>
          <span className={styles.label}>cash agents nearby</span>
        </div>
      </div>
      <button
        className={styles.whatsappButton}
        onClick={handleWhatsAppClick}
        aria-label="Contact via WhatsApp"
        type="button"
      >
        <Image
          src="/assets/WhatsApp_Balck.png"
          alt="WhatsApp"
          width={27}
          height={27}
          className={styles.whatsappIcon}
        />
      </button>
    </div>
  )
}

