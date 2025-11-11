'use client'

import Image from 'next/image'
import styles from './LoadingScreen.module.css'

export default function LoadingScreen() {
  return (
    <div className={styles.splash}>
      <div className={styles.logoWrapper}>
        <Image
          src="/assets/core/gobankless-logo.png"
          alt="GoBankless"
          fill
          style={{ objectFit: 'contain' }} // ✅ preserve aspect ratio
          priority
          sizes="(max-width: 600px) 80vw, 280px"
        />
      </div>
    </div>
  )
}

