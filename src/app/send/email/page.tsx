'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SendForm from '@/components/SendForm'
import { formatZARWithDot } from '@/lib/money'

export const dynamic = 'force-dynamic'

function SendEmailPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const amountParam = searchParams.get('amount')
  const amountZAR = amountParam ? parseFloat(amountParam) : 0
  const formattedAmount = formatZARWithDot(amountZAR)

  const handleClose = () => {
    router.back()
  }

  const handleSubmit = (payload: { to: string; note: string }) => {
    console.log({
      amount: amountZAR,
      recipient: payload.to,
      note: payload.note || undefined,
    })
    // TODO: wire backend
    router.back()
  }

  return (
    <SendForm amountZAR={formattedAmount} onClose={handleClose} onSubmit={handleSubmit} />
  )
}

export default function SendEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendEmailPageContent />
    </Suspense>
  )
}

