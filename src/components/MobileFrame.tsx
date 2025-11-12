'use client'

import { ReactNode } from 'react'
import styles from './MobileFrame.module.css'

export default function MobileFrame({ children }: { children: ReactNode }) {
  return <div className={styles.frame}>{children}</div>
}

