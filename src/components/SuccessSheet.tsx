'use client'

import { useEffect } from 'react'
import ActionSheet from './ActionSheet'
import '@/styles/success-sheet.css'

type SuccessSheetProps = {
  open: boolean
  onClose: () => void
  amountZAR: string // formatted via formatZAR()
  recipient: string // email or phone
  autoDownloadReceipt?: boolean // default true
}

export default function SuccessSheet({
  open,
  onClose,
  amountZAR,
  recipient,
  autoDownloadReceipt = true,
}: SuccessSheetProps) {
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
      <div className="success-wrap" role="dialog" aria-labelledby="success-title">
        <div className="success-top">
          <svg
            className="success-tick"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-5" />
          </svg>
          <h2 id="success-title" className="success-title" aria-live="polite">
            You sent {amountZAR} to
            <br />
            <span className="success-recipient">{recipient}</span>
          </h2>
        </div>
        <div className="success-bottom">
          <p className="success-note">Proof of payment will be emailed to you</p>
          <button className="success-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </ActionSheet>
  )
}

