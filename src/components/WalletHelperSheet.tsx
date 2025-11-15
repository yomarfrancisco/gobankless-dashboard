'use client'

import { useState } from 'react'
import Image from 'next/image'
import ActionSheet from './ActionSheet'
import styles from './WalletHelperSheet.module.css'

type WalletKey = 'savings' | 'pepe' | 'yield' | 'mzn' | 'btc'

type WalletHelperSheetProps = {
  walletKey: WalletKey | null
  onClose: () => void
}

const walletTitleMap: Record<WalletKey, string> = {
  savings: 'ZAR wallet',
  mzn: 'MZN wallet',
  pepe: 'PEPE wallet',
  yield: 'ETH wallet',
  btc: 'BTC wallet',
}

const cardImages: Record<WalletKey, string> = {
  savings: '/assets/cards/card-savings.jpg',
  pepe: '/assets/cards/card-pepe.jpg',
  yield: '/assets/cards/card-ETH.jpg',
  mzn: '/assets/cards/card-MZN.jpg',
  btc: '/assets/cards/card-BTC.jpg',
}

export default function WalletHelperSheet({ walletKey, onClose }: WalletHelperSheetProps) {
  if (!walletKey) return null

  const title = walletTitleMap[walletKey]
  const cardImage = cardImages[walletKey]

  return (
    <ActionSheet open={!!walletKey} onClose={onClose} title="" size="tall">
      <div className={styles.content}>
        {/* Title row with close button */}
        <div className={styles.titleRow}>
          <h2 className={styles.titleText}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Descriptive paragraph */}
        <p className={styles.description}>
          A savings account that earns interest on your deposits while enabling you to make direct payments on the app
        </p>

        {/* Card preview */}
        <div className={styles.cardPreviewWrapper}>
          <div className={styles.cardMini}>
            <Image
              src={cardImage}
              alt={title}
              fill
              className={styles.cardImage}
              sizes="204px"
              unoptimized
            />
          </div>
        </div>

        {/* Feature rows */}
        <div className={styles.features}>
          <div className={styles.featureRow}>
            <div className={styles.featureLabel}>Anytime</div>
            <div className={styles.featureValue}>Access to funds with no lock-in period</div>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureLabel}>0%</div>
            <div className={styles.featureValue}>Tax on interest earned</div>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureLabel}>Zero</div>
            <div className={styles.featureValue}>Fees on payments and transfers</div>
          </div>
        </div>

        {/* Interest info */}
        <div className={styles.interestInfo}>
          <p className={styles.interestText}>Earn 9% annually on your deposits</p>
          <p className={styles.interestSubtext}>Compounded monthly</p>
        </div>
      </div>
    </ActionSheet>
  )
}

