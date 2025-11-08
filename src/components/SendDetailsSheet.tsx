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

  // Focus after the open transition completes (iOS needs this)
  useEffect(() => {
    if (!open || !autoFocusOnMount) return

    const el = containerRef.current
    if (!el) return

    const focusNow = () => {
      // Double RAF + small timeout is the most reliable on iOS Safari
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const input = toRef.current
            if (input) {
              input.focus({ preventScroll: true })
              // Place caret at end to force visible cursor
              const len = input.value.length
              try {
                input.setSelectionRange(len, len)
              } catch {
                // Ignore if setSelectionRange fails
              }
            }
            onAfterAutoFocus?.()
          }, 40)
        })
      })
    }

    // Try after the CSS transition ends (best), else fallback timer
    let fired = false
    const onEnd = () => {
      if (fired) return
      fired = true
      focusNow()
    }

    // Find the parent .as-sheet element that has the animation
    // Use a small delay to ensure the element is in the DOM
    const findSheetAndListen = () => {
      const sheetElement = el.closest('.as-sheet')
      if (sheetElement) {
        sheetElement.addEventListener('transitionend', onEnd, { once: true })
        return sheetElement
      }
      return null
    }

    const sheetElement = findSheetAndListen()
    // Retry if not found immediately (portal might not be ready)
    if (!sheetElement) {
      setTimeout(findSheetAndListen, 10)
    }

    // Fallback if no transition event fires
    const t = setTimeout(onEnd, 300)

    return () => {
      const sheet = el.closest('.as-sheet')
      if (sheet) {
        sheet.removeEventListener('transitionend', onEnd)
      }
      clearTimeout(t)
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

