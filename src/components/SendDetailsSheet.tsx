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

  // Ensure containerRef is present immediately after mount
  useLayoutEffect(() => {
    // This ensures DOM is ready when we need it
  }, [open])

  // Focus after the open animation completes (iOS needs this)
  useEffect(() => {
    if (!open || !autoFocusOnMount) return

    const el = containerRef.current
    if (!el) return

    let done = false

    const focusNow = () => {
      if (done) return
      done = true

      // iOS: double RAF then tiny delay is most reliable AFTER animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const input = toRef.current
            if (input) {
              console.log('Focusing input:', input)
              input.focus({ preventScroll: true })
              // Put caret at end to show visible cursor
              const len = input.value.length
              try {
                input.setSelectionRange(len, len)
              } catch {
                // Ignore if setSelectionRange fails
              }
              console.log('Focused:', document.activeElement === input)
            }
            onAfterAutoFocus?.()
          }, 40)
        })
      })
    }

    // Listen for CSS *animation* end (we use keyframes, not transitions)
    const onAnimEnd = (e: Event) => {
      const animEvent = e as AnimationEvent
      // Only listen to the slideUp animation on the sheet
      if (animEvent.animationName === 'slideUp') {
        console.log('animationend fired for slideUp')
        focusNow()
      }
    }

    // Find the parent .as-sheet element that has the animation
    const findSheetAndListen = () => {
      const sheetElement = el.closest('.as-sheet')
      if (sheetElement) {
        console.log('Found sheet element, adding animationend listener')
        sheetElement.addEventListener('animationend', onAnimEnd, { once: true })
        return sheetElement
      }
      console.log('Sheet element not found yet')
      return null
    }

    const sheetElement = findSheetAndListen()
    // Retry if not found immediately (portal might not be ready)
    if (!sheetElement) {
      setTimeout(() => {
        const retryElement = findSheetAndListen()
        if (!retryElement) {
          console.log('Sheet element still not found, using fallback')
        }
      }, 10)
    }

    // Fallback after animation duration + buffer (300ms animation + 60ms buffer)
    const fallback = setTimeout(() => {
      console.log('Fallback timer fired')
      focusNow()
    }, 360)

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

