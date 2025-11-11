'use client'

import Image from 'next/image'
import styles from './LoadingScreen.module.css'

export default function LoadingScreen() {
  return (
    <div className={styles.splash}>
      <Image
        src="/assets/core/gobankless-logo.png"
        alt="GoBankless"
        width={220}
        height={80}
        priority
        unoptimized
      />
    </div>
  )
}

