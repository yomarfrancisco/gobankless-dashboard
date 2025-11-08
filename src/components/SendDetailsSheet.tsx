'use client'

import { useState, useEffect, useRef } from 'react'
import ActionSheet from './ActionSheet'
import Image from 'next/image'
import '@/styles/send-details-sheet.css'

type SendDetailsSheetProps = {
  open: boolean
  onClose: () => void
  amountZAR: number // from AmountSheet
  onPay?: (payload: { to: string; note?: string; amountZAR: number }) => void
}

export default function SendDetailsSheet({ open, onClose, amountZAR, onPay }: SendDetailsSheetProps) {
  const [to, setTo] = useState('')
  const [note, setNote] = useState('')
  const toRef = useRef<HTMLInputElement>(null)

  // iOS: focus after open animation to reliably show keyboard
  useEffect(() => {
    if (!open) return

    const id = window.requestAnimationFrame(() => {
      setTimeout(() => {
        toRef.current?.focus({ preventScroll: true })
      }, 150)
    })

    return () => cancelAnimationFrame(id)
  }, [open])

  const canPay = amountZAR > 0 && to.trim().length > 0

  const formattedAmount = amountZAR.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const handlePay = () => {
    if (canPay && onPay) {
      onPay({
        to: to.trim(),
        note: note.trim() || undefined,
        amountZAR,
      })
    }
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="" className="send-details">
      <div className="send-details-sheet">
        <div className="send-details-header">
          <button className="send-details-close" onClick={onClose} aria-label="Close">
            <Image src="/assets/clear.svg" alt="" width={18} height={18} />
          </button>
          <h3 className="send-details-title">{`Send R${formattedAmount}`}</h3>
          <button
            className="send-details-pay"
            disabled={!canPay}
            onClick={handlePay}
            type="button"
          >
            Pay
          </button>
        </div>
        <div className="send-details-fields">
          <label className="send-details-row">
            <span className="send-details-label">To</span>
            <input
              ref={toRef}
              className="send-details-input"
              placeholder="email or phone"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="email"
              enterKeyHint="next"
              type="text"
            />
            <div className="send-details-underline" />
          </label>
          <label className="send-details-row">
            <span className="send-details-label">For</span>
            <input
              className="send-details-input"
              placeholder="add a note or reference"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              inputMode="text"
              type="text"
            />
            <div className="send-details-underline" />
          </label>
        </div>
      </div>
    </ActionSheet>
  )
}

