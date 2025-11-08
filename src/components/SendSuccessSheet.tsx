'use client'

import { useEffect } from 'react'
import ActionSheet from './ActionSheet'
import styles from './SendSuccessSheet.module.css'
import '@/styles/send-success-sheet.css'

type SendSuccessSheetProps = {
  open: boolean
  onClose: () => void
  amountZAR: string // already formatted, e.g. "R 100.00"
  recipient: string // email or phone (raw)
  autoDownloadReceipt?: boolean // default true
}

export default function SendSuccessSheet({
  open,
  onClose,
  amountZAR,
  recipient,
  autoDownloadReceipt = true,
}: SendSuccessSheetProps) {
  useEffect(() => {
    if (!open || !autoDownloadReceipt) return

    // TODO: replace with real receipt URL once backend available
    try {
      const a = document.createElement('a')
      a.href = '/api/receipt.pdf' // placeholder endpoint
      a.download = 'payment-receipt.pdf'
      // Fire and forget (will no-op if endpoint not present)
      setTimeout(() => a.click(), 150)
    } catch {
      // Ignore errors
    }
  }, [open, autoDownloadReceipt])

  return (
    <ActionSheet open={open} onClose={onClose} title="" className="send-success">
      <div className={styles.wrap} role="dialog" aria-labelledby="sx-title">
        <div className={styles.header}>
          <img
            src="/assets/checkmark_circle_outlined.png"
            alt=""
            className={styles.tick}
          />
          <h2 id="sx-title" className={styles.headline} aria-live="polite">
            You sent {amountZAR} to
            <br />
            <span className={styles.bold}>{recipient}</span>
          </h2>
        </div>
        <div className={styles.footer}>
          <p className={styles.proof}>Proof of payment will be emailed to you</p>
          <button className={styles.cta} onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </ActionSheet>
  )
}

