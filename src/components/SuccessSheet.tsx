'use client'

import { useEffect } from 'react'
import ActionSheet from './ActionSheet'
import '@/styles/success-sheet.css'

type SuccessSheetProps = {
  open: boolean
  onClose: () => void
  amountZAR: string // formatted via formatZAR()
  recipient?: string // email or phone (optional for deposit)
  autoDownloadReceipt?: boolean // default true
  kind?: 'send' | 'deposit' // default 'send'
}

export default function SuccessSheet({
  open,
  onClose,
  amountZAR,
  recipient,
  autoDownloadReceipt = true,
  kind = 'send',
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
      <div className="success-sheet" role="dialog" aria-labelledby="success-title">
        <div className="success-header">
          <img
            src="/assets/checkmark_circle.svg"
            alt="success"
            className="success-icon"
            width={56}
            height={56}
          />
          {kind === 'deposit' ? (
            <>
              <p id="success-title" className="success-headline" aria-live="polite">
                Deposit successful
              </p>
              <p className="success-target">You deposited {amountZAR}.</p>
            </>
          ) : (
            <>
              <p id="success-title" className="success-headline" aria-live="polite">
                You sent {amountZAR} to
              </p>
              <p className="success-target">{recipient}</p>
            </>
          )}
        </div>
        <div className="success-spacer" />
        <p className="success-receipt">Proof of payment will be emailed to you</p>
        <button className="success-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </ActionSheet>
  )
}

