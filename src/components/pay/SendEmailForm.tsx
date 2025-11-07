'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import '@/styles/send-email-form.css'

export default function SendEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const amountParam = searchParams.get('amount')
  const amountZAR = amountParam ? parseFloat(amountParam) : 0

  const [to, setTo] = useState('')
  const [note, setNote] = useState('')

  // Format amount with dot decimals
  const formattedAmount = amountZAR.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  // Validation: email regex OR phone (digits/+/spaces, at least 8 chars)
  const isValidEmail = (str: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(str.trim())
  }

  const isValidPhone = (str: string) => {
    const phoneRegex = /^[\d\s+]{8,}$/
    return phoneRegex.test(str.trim())
  }

  const isValidRecipient = to.trim().length > 0 && (isValidEmail(to) || isValidPhone(to))
  const canPay = amountZAR > 0 && isValidRecipient

  const handlePay = () => {
    if (canPay) {
      console.log({
        amount: amountZAR,
        recipient: to.trim(),
        note: note.trim() || undefined,
      })
      // TODO: wire backend
      router.back()
    }
  }

  const handleClose = () => {
    router.back()
  }

  return (
    <div className="send-email-page">
      {/* Fixed Header */}
      <div className="send-email-header">
        <button className="send-email-close" onClick={handleClose} aria-label="Close" type="button">
          <Image src="/assets/clear.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="send-email-title">{`Send R ${formattedAmount}`}</h1>
        <button
          className="send-email-pay"
          disabled={!canPay}
          onClick={handlePay}
          type="button"
        >
          Pay
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="send-email-body">
        <div className="send-email-field-row">
          <label className="send-email-label">To</label>
          <input
            className="send-email-input send-email-input-to"
            placeholder="email or phone"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            inputMode="email"
            autoComplete="email"
            type="text"
          />
        </div>
        <div className="send-email-field-row">
          <label className="send-email-label">For</label>
          <input
            className="send-email-input send-email-input-for"
            placeholder="add a note or reference"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            type="text"
          />
        </div>
      </div>
    </div>
  )
}

