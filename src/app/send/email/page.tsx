import { Suspense } from 'react'
import SendEmailForm from '@/components/pay/SendEmailForm'

export const dynamic = 'force-dynamic'

export default function SendEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendEmailForm />
    </Suspense>
  )
}

