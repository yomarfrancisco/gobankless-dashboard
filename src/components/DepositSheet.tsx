'use client'

import Image from 'next/image'
import BottomSheet from './ui/BottomSheet'
import styles from './DepositSheet.module.css'

interface DepositSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (method: 'bank' | 'card' | 'crypto') => void
}

const depositMethods = [
  {
    key: 'bank' as const,
    title: 'Direct bank transfer',
    subtitle: 'Link your bank account. Deposits reflect in 2-3 days.',
  },
  {
    key: 'card' as const,
    title: 'Debit or Credit',
    subtitle: 'Link your debit or credit card for instant deposits.',
  },
  {
    key: 'crypto' as const,
    title: 'Crypto wallet',
    subtitle: 'Receive USDT directly from an external wallet.',
  },
]

export default function DepositSheet({ isOpen, onClose, onSelect }: DepositSheetProps) {
  const handleSelect = (method: 'bank' | 'card' | 'crypto') => {
    onSelect?.(method)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Deposit method">
      <div className={styles.header}>
        <h2 id="bottom-sheet-title" className={styles.title}>
          Deposit method
        </h2>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          <Image
            src="/assets/clear.svg"
            alt=""
            className={styles.closeIcon}
            width={24}
            height={24}
          />
        </button>
      </div>

      <div className={styles.list}>
        {depositMethods.map((method) => (
          <button
            key={method.key}
            className={styles.row}
            onClick={() => handleSelect(method.key)}
          >
            <div className={styles.iconCircle}>
              <Image
                src="/assets/up right.svg"
                alt=""
                width={24}
                height={24}
              />
            </div>
            <div className={styles.textContent}>
              <h3 className={styles.rowTitle}>{method.title}</h3>
              <p className={styles.rowSubtitle}>{method.subtitle}</p>
            </div>
            <Image
              src="/assets/next_ui.svg"
              alt=""
              className={styles.chevron}
              width={24}
              height={24}
            />
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}

