'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import ActionSheet from './ActionSheet'
import Image from 'next/image'
import '@/styles/send-details-sheet.css'

type SendDetailsSheetProps = {
  open: boolean
  onClose: () => void
  amountZAR: number // from AmountSheet
  onPay?: (payload: { to: string; note?: string; amountZAR: number }) => void
  autoFocusOnMount?: boolean
  onAfterAutoFocus?: () => void
}

export default function SendDetailsSheet({ 
  open, 
  onClose, 
  amountZAR, 
  onPay,
  autoFocusOnMount = false,
  onAfterAutoFocus
}: SendDetailsSheetProps) {
  const [to, setTo] = useState('')
  const [note, setNote] = useState('')
  const toRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Hand off focus from shim to real input after animation completes
  useEffect(() => {
    if (!open || !autoFocusOnMount) return

    const el = containerRef.current
    if (!el) return

    let done = false

    const handoff = () => {
      if (done) return
      done = true

      // Allow paint after animation then move focus
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            toRef.current?.focus({ preventScroll: true })
            try {
              const len = toRef.current?.value.length ?? 0
              toRef.current?.setSelectionRange(len, len)
            } catch {
              // Ignore if setSelectionRange fails
            }
            onAfterAutoFocus?.()
          }, 30)
        })
      })
    }

    const onAnimEnd = (e: Event) => {
      const animEvent = e as AnimationEvent
      // Only listen to the slideUp animation on the sheet
      if (animEvent.animationName === 'slideUp') {
        handoff()
      }
    }

    // Find the parent .as-sheet element that has the animation
    const findSheetAndListen = () => {
      const sheetElement = el.closest('.as-sheet')
      if (sheetElement) {
        sheetElement.addEventListener('animationend', onAnimEnd, { once: true })
        return sheetElement
      }
      return null
    }

    const sheetElement = findSheetAndListen()
    // Retry if not found immediately (portal might not be ready)
    if (!sheetElement) {
      setTimeout(() => {
        findSheetAndListen()
      }, 10)
    }

    // Fallback after animation duration + buffer (300ms animation + 80ms buffer)
    const fallback = setTimeout(handoff, 380)

    return () => {
      const sheet = el.closest('.as-sheet')
      if (sheet) {
        sheet.removeEventListener('animationend', onAnimEnd)
      }
      clearTimeout(fallback)
    }
  }, [open, autoFocusOnMount, onAfterAutoFocus])

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
      <div className="send-details-sheet" ref={containerRef}>
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

