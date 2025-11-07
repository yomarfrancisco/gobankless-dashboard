import { useState } from 'react'
import s from './SendForm.module.css'

export default function SendForm({
  amountZAR,
  onClose,
  onSubmit,
}: {
  amountZAR: string // e.g. "R 2,00" (use whatever we already display)
  onClose: () => void
  onSubmit: (payload: { to: string; note: string }) => void
}) {
  const [to, setTo] = useState('')
  const [note, setNote] = useState('')

  const canPay = to.trim().length > 0

  return (
    <div className={s.page} role="dialog" aria-modal="true">
      <header className={s.header}>
        <button className={s.close} aria-label="Close" onClick={onClose}>
          ✕
        </button>
        <div className={s.title}>Send {amountZAR}</div>
        <button
          className={`${s.pay} ${canPay ? s.payEnabled : ''}`}
          disabled={!canPay}
          onClick={() => canPay && onSubmit({ to: to.trim(), note })}
        >
          Pay
        </button>
      </header>
      <main className={s.body}>
        <label className={s.row}>
          <span className={s.label}>To</span>
          <input
            className={s.input}
            placeholder="email or phone"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <div className={s.underline} />
        </label>
        <label className={s.row}>
          <span className={s.label}>For</span>
          <input
            className={s.input}
            placeholder="add a note or reference"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className={s.underline} />
        </label>
      </main>
    </div>
  )
}

